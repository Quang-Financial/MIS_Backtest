(() => {
  'use strict';
  const search = document.querySelector('#glossary-search');
  const count = document.querySelector('#glossary-count');
  const entries = Array.from(document.querySelectorAll('#research-glossary dt'), term => {
    const description = term.nextElementSibling;
    return { term, description, text: normalize(term.textContent + ' ' + description.textContent) };
  });

  function normalize(value) {
    return value.toLocaleLowerCase('vi').normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd');
  }

  function searchTerms() {
    const query = normalize(search.value.trim());
    let matches = 0;
    for (const { term, description, text } of entries) {
      const visible = text.includes(query);
      term.hidden = description.hidden = !visible;
      matches += Number(visible);
    }
    count.textContent = matches ? matches + ' mục phù hợp' : 'Không tìm thấy thuật ngữ.';
  }

  search.addEventListener('input', searchTerms);
  searchTerms();
})();
