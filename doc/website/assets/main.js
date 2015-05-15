(function (document) {
  var tocContainer = document.querySelectorAll('.main-toc')[0];

  var data = [].reduce.call(tocContainer.children, function (acc, el) {

    var matches = el.href.match(/.*\/(.*)\/(.*).html/),
        sectionName = matches[1];

    if (!sectionName) {
      sectionName = 'misc';
    }

    if (!acc[sectionName]) {
      acc[sectionName] = [];
    }

    acc[sectionName].push(el);

    return acc;

  }, {});

  var root = document.createElement('ul');
  // important for order of toc
  ['cli', 'api', 'misc'].reduce(function (acc, section) {

    var root, heading, subsection;
    root = document.createElement('li');
    heading = document.createElement('span');
    heading.textContent = section;
    root.appendChild(heading);

    subsection = document.createElement('ul');
    data[section].forEach(function (hyperlink) {
      var subsectionChild, hyperlink;
      subsectionChild = document.createElement('li');
      subsectionChild.appendChild(hyperlink);
      subsection.appendChild(subsectionChild);
    });
    root.appendChild(subsection);

    acc.push(root);
    return acc;
  }, []).forEach(function (el) {
    root.appendChild(el);
  });

  tocContainer.innerHTML = '';
  tocContainer.appendChild(root);
})(document);
