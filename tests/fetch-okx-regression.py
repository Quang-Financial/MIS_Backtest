"""Fetch closed OKX UTC daily candles for a reproducible market audit."""
import concurrent.futures
import datetime
import json
import pathlib
import subprocess
import sys
import time
import urllib.parse

DAY = 86400000
CUTOFF = int(datetime.datetime(2026, 11, 25, tzinfo=datetime.timezone.utc).timestamp()) * 1000
COINS = ('SOL', 'AVAX', 'LINK', 'BNB', 'OKB', 'SUI')
PAGES = 20


def load_page(coin, page):
    query = urllib.parse.urlencode(dict(instId=coin + '-USDT', bar='1Dutc', limit=100,
                                        after=CUTOFF - page * 100 * DAY))
    url = 'https://www.okx.com/api/v5/market/history-candles?' + query
    for attempt in range(3):
        try:
            payload = json.loads(subprocess.check_output(
                ['curl', '-fsS', '--max-time', '12', url], stderr=subprocess.DEVNULL))
            if payload['code'] == '0':
                return coin, page, payload['data'], None
        except (ValueError, KeyError, subprocess.SubprocessError):
            pass
        time.sleep(attempt + 1)
    return coin, page, [], 'request failed'


def main():
    output = pathlib.Path(sys.argv[1])
    output.mkdir(parents=True, exist_ok=True)
    results = {coin: {} for coin in COINS}
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        futures = [pool.submit(load_page, coin, page) for page in range(PAGES) for coin in COINS]
        for future in concurrent.futures.as_completed(futures):
            coin, page, rows, error = future.result()
            results[coin][page] = (rows, error)
    for coin, pages in results.items():
        by_time = {}
        failed = []
        for page, (rows, error) in sorted(pages.items()):
            if error:
                failed.append(page)
            lower = CUTOFF - (page + 1) * 100 * DAY
            upper = lower + 100 * DAY
            for row in rows:
                t = int(row[0])
                if row[8] != '1' or not lower <= t < upper:
                    continue
                by_time[t] = dict(zip(('o', 'h', 'l', 'c'), map(float, row[1:5])))
        bars = [dict(t=t, **by_time[t]) for t in sorted(by_time)]
        record = dict(source='OKX ' + coin + '-USDT confirmed 1Dutc', failedPages=failed, bars=bars)
        (output / (coin + '.json')).write_text(json.dumps(record, separators=(',', ':')))
        print(coin, len(bars), failed, flush=True)


if __name__ == '__main__':
    main()
