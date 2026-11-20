/* PETTITT WEALTH — small, dependency-free site script */
(function () {
  'use strict';

  // Mobile navigation toggle
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Reveal-on-scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Footer year
  var y = document.getElementById('year');
  if (y) { y.textContent = new Date().getFullYear(); }

  // Conversation request form -> opens the visitor's email client (no back end; nothing is sent from this site)
  var form = document.getElementById('appointment-form');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = function (id) { var el = form.querySelector('#' + id); return el ? el.value.trim() : ''; };
      var name = v('f-name'), email = v('f-email'), phone = v('f-phone'),
          topic = v('f-topic'), when = v('f-when'), msg = v('f-message');

      var subject = 'PETTITT WEALTH Conversation Request' + (topic ? ' — ' + topic : '') + (name ? ' (' + name + ')' : '');
      var lines = [
        'Hello Eric,',
        '',
        'I would like to start a conversation with PETTITT WEALTH.',
        '',
        'Name: ' + name,
        'Email: ' + email,
        'Phone: ' + (phone || 'n/a'),
        'Topic: ' + (topic || 'General consultation'),
        'Preferred dates / times: ' + (when || 'Flexible'),
        '',
        msg ? 'Additional details:\n' + msg : '',
        '',
        'Thank you.'
      ];
      var body = lines.join('\n');
      var to = form.getAttribute('data-to') || 'eric@pettittwealth.com';
      window.location.href = 'mailto:' + to +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      var note = document.getElementById('form-status');
      if (note) { note.textContent = 'Your email app should now open with your request. Review it and press Send in your email app to deliver it. If your email app does not open, email ' + to + ' or call (480) 933-5277.'; }
    });
  }
})();
