'use strict';

$(function () {

  var baseUrl = "/api.php/";
  var organizationNames;
  var organizationIDs;
  var urlParams, rangeSlider, organizationInput;
  var template = $('#table-template').html();
  var target = document.getElementById('data-table');
  var START_YEAR = 1915;
  var END_YEAR = 2016;
  var default_start_year = 2000;
  var default_end_year = 2016;
  var opts = {
    lines: 12               // The number of lines to draw
    , length: 7             // The length of each line
    , width: 5              // The line thickness
    , radius: 10            // The radius of the inner circle
    , scale: 3              // Scales overall size of the spinner
    , corners: 1            // Roundness (0..1)
    , color: '#888888'      // #rgb or #rrggbb
    , opacity: 1 / 4        // Opacity of the lines
    , rotate: 0             // Rotation offset
    , direction: 1          // 1: clockwise, -1: counterclockwise
    , speed: 1.5            // Rounds per second
    , trail: 100            // Afterglow percentage
    , fps: 20               // Frames per second when using setTimeout()
    , zIndex: 2e9           // Use a high z-index by default
    , className: 'spinner'  // CSS class to assign to the element
    , top: '50%'            // center vertically
    , left: '55%'           // center horizontally
    , shadow: false         // Whether to render a shadow
    , hwaccel: false        // Whether to use hardware acceleration (might be buggy)
    , position: 'absolute'  // Element positioning
  };
  var table;

  start();

  function start() {
    if (window.location.hash) {
      urlParams = parseHashParams(window.location.hash);
    } else {
      setDefaultUrlParams();
    }
    loadOrganizations().then(function () {
      updateTable(urlParams['pageNumber'], urlParams['pageLength']); //page //length
      addOrgListToFilter();
      updateFilters();
      downloadButton();
      queryButton();
      hashChange();
    });
    createRangeSlider();
    openTermsOfUse();
    displayMenu();
  }

  function loadOrganizations() {
    organizationNames = [];
    organizationIDs = [];

    return $.get(baseUrl + "organizations", function (data) {
      data.forEach(function (organization) {
        organizationNames[organization.properName] = organization.id;
        organizationIDs[organization.orgID] = organization.properName;
      });
    });
  }

  // Generates the Slider for the Querydb section.
  function createRangeSlider() {
    rangeSlider = document.getElementById('slider-range');
    var min = START_YEAR, max = END_YEAR;
    noUiSlider.create(rangeSlider, {
      start: [min, max],
      range: {
        'min': [START_YEAR],
        'max': [END_YEAR]
      },
      step: 1
    });
    rangeSlider.noUiSlider.on('update', function (values) {
      $('#min').val(String(values[0]).slice(0, -3));
      $('#max').val(String(values[1]).slice(0, -3));
    });
  }

  // Setup organization multi-select
  function addOrgListToFilter() {
    organizationInput = $('.organization-input').select2({
      minimumInputLength: 3,
      ajax: {
        url: baseUrl + 'organizations/search/',
        delay: 250,
        data: function (params) {
          return {
            q: params.term
          }
        },
        processResults: function (data, params) {
          return {
            results: data
          };
        },
        cache: false
      },
      escapeMarkup: function (markup) {
        return markup;
      },
      templateResult: function (data) {
        return data.properName;
      },
      templateSelection: function (data) {
        return data.properName;
      }
    });
  }

  // Update the query interface filters
  function updateFilters() {
    if (!urlParams) {
      setDefaultUrlParams();
    }
    var caseid, and, organizations, min = START_YEAR, max = END_YEAR, pageNumber, pageLength;
    caseid = urlParams['caseid'];
    and = urlParams['and'];
    min = urlParams['minRange'];
    max = urlParams['maxRange'];
    organizations = urlParams['organizations'];
    pageNumber = urlParams['pageNumber'];
    pageLength = urlParams['pageLength'];
    // Set values below slider
    $('#min').val(min);
    $('#max').val(max);
    // Set actual slider values
    rangeSlider.noUiSlider.set([min, max]);
    // Refills in the form from values submitted by the user
    document.getElementById('caseid').value = caseid;

    if (organizations) {

      organizations.split(',').forEach(function (orgId) {
        // Update select input with values from hash
        organizationInput.select2('trigger', 'select', {
          data: {id: orgId, properName: organizationIDs[orgId]}
        });
      });
    } else {
      organizationInput.val(null).trigger('change');
    }

    $('#or').attr('checked', !and);
    $('#display').val(pageLength);
  }

// Parse the parameters after the hash in the URI
  function parseHashParams(hash) {
    if (!hash.length) {
      return;
    }
    hash = atob(hash.slice(1, hash.length));
    var params = {},
      individualVars = hash.split('&');
    for (var i = 0; i < individualVars.length; i++) {
      var query = individualVars[i].split('=')[0];
      var value = individualVars[i].split('=')[1];
      if (query in params) {
        params[query].push(value);
      } //add value to the array if it exists
      else {
        params[query] = value;
      } //if query isn't in params, create a new array
    }
    return params;
  }

  function updateTable(pageNumber, pageLength) {
    if (!urlParams) {
      setDefaultUrlParams();
    }
    // TODO fix direction not being orderable
    if ($.fn.dataTable.isDataTable('#table')) {
      table.draw();
    } else {
      table = $('#table').DataTable({
        'ordering': true,
        'searching': false,
        'processing': true,
        'serverSide': true,
        'pageLength': pageLength,
        'ajax': {
          'url': 'api.php',
          'data': function (d) {
            d.data = urlParams
          }
        },
        'scrollY': '950px',
        'scrollCollapse': true,
        'order': [[1, 'asc']],
        'columns': [
          {
            'className': 'details-control',
            'data': null,
            'defaultContent': '',
            'orderable': false
          }, {
            'name': 'signers.briefID',
            'data': 'briefID',
            'width': '15%',
            'orderable': true
          }, {
            'name': 'briefs.direction',
            'data': 'direction',
            'width': '10%',
            'className': 'dt-center',
            'orderable': false,
            'render': renderDirectionColumn
          }, {
            'name': 'signers.caseID',
            'data': 'caseID',
            'width': '11%',
            'orderable': true,
            'render': renderCaseId
          }, {
            'name': 'spaethcases.caseName',
            'data': 'caseName',
            'width': '54%',
            'orderable': true
          }, {
            'name': 'briefs.opinionYear',
            'data': 'opinionYear',
            'width': '10%',
            'className': 'dt-center',
            'orderable': true
          }
        ],
        'paging': true
      });
    }

    // Expand table rows on click
    $('#table').find('tbody').on('click', 'td.details-control', function () {
      var tr = $(this).closest('tr');
      var row = table.row(tr);
      var data = row.data();

      if (row.child.isShown()) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
      }
      else {
        // Open this row
        row.child(buildRow(data['orgIDs'])).show();
        tr.addClass('shown');

        // Add onclick function to the button so it opens up modal
        $(".modal-form-button").click(function () {
          openForm($(this)[0]);
        })
      }
    });
  }

  function getDirection(direction) {
    switch (direction) {
      case "1":
        return {
          title: "For Petitioner",
          image: "petitioner.png",
          alt: "For Petitioner"
        };
      case "2":
        return {
          title: "Neutral",
          image: "arrow_neutral.png",
          alt: "Neutral"
        };
      case "3":
        return {
          title: "For Respondent",
          image: "respondent.png",
          alt: "For Respondent"
        };
    }
  }

  // Build expanded row
  function buildRow(d) {
    var orgs = [];
    d.split(',').forEach(function (orgID) {
      orgs.push(organizationIDs[orgID]);
    });

    return '<span class="organizations-title">Organizations: </span>' +
      '<span class="organizations-list">' + toTitleCase(orgs.join('<br />')) + '</span>' +
      "<div class='modal-form-button'><img src=\"images/suggest-edit.png\" alt=\"Suggest edit\" title=\"Suggest edit\" /></div>";
  }

  function renderDirectionColumn(data) {
    if (data === "-1") {
      return data;
    }
    var direction = getDirection(data);
    return '<img src="images/' + direction.image + '" alt="' + direction.alt + '" title="' + direction.title + '"/>';
  }

  function renderCaseId(data) {
    return '<a class="spaeth-link" href="http://scdb.wustl.edu/analysisCaseDetail.php?sid=&cid=' + data + '-01&pg=0" target=\"_blank\">' + data + '</a>';
  }

  // Convert string to "Title Case"
  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  function openTermsOfUse() {
    //check if localStorage is available
    if (typeof(Storage) !== "undefined") {
      //if not agreed to terms of use, show termsOfUse
      if (!localStorage.getItem("termsOfUse")) {
        $('#terms-of-use').css('display', 'block');
        $('#close-terms').click(closeTermsOfUse);
      }
    } else {
      //No Web Storage support.. show termsOfUse then
      $('#terms-of-use').css('display', 'block');
      $('#close-terms').click(closeTermsOfUse);
    }
  }

  function closeTermsOfUse() {
    localStorage.setItem("termsOfUse", true);
    $('#close-terms').unbind('click');
    $('#terms-of-use').css('display', 'none');
  }

  function downloadButton() {
    $('.download').click(function () {
      var min = urlParams['minRange'],
        max = urlParams['maxRange'],
        orgs = urlParams['organizations'] ? urlParams['organizations'] : -1,
        and = urlParams['and'],
        caseid = urlParams['caseid'] ? '/' + urlParams['caseid'] : '';

      var l = Ladda.create(document.querySelector('.download'));
      l.start();

      $.get({
        url: baseUrl + 'briefs/' + min + '/' + max + '/' + orgs + '/' + and + '/0/100000' + caseid
      }).then(function (data) {
        saveAs(new Blob([JSON.stringify(data)], {type: "text/plain;charset=utf-8"}), 'download.json');
        l.stop();
        l.remove();
      });

    });
  }

  function hashChange() {
    $(window).on('hashchange', function () {
      urlParams = parseHashParams(window.location.hash);
      updateFilters();
      updateTable();
    });
  }

  function queryButton() {
    //Handles the querying of the table
    $('#query-button').click(function () {
      //$('#data-table').html('');
      var caseid = $('#caseid').val(),
        minRange = $('#min').val(),
        maxRange = $('#max').val(),
        organizations = $('#organizations').val().join(',');

      var and = $('input[name=and]:radio:checked').val() === "true" ? 1 : 0;
      var uriHash = 'caseid=' + caseid;
      uriHash += '&minRange=' + minRange;
      uriHash += '&maxRange=' + maxRange;
      uriHash += '&and=' + and;
      uriHash += '&organizations=' + organizations;
      uriHash += '&pageNumber=' + 0;
      uriHash += '&pageLength=' + urlParams['pageLength'];
      window.location.hash = btoa(uriHash);
      urlParams = parseHashParams(window.location.hash);
      updateTable(0, urlParams['pageLength'][0]);
    });
  }

  function setDefaultUrlParams() {
    urlParams = {};
    urlParams['caseid'] = '';
    urlParams['and'] = 1;
    urlParams['organizations'] = '';
    urlParams['minRange'] = default_start_year;
    urlParams['maxRange'] = default_end_year;
    urlParams['pageNumber'] = 0;
    urlParams['pageLength'] = 50;
  }

  function openForm(el) {
    var parentEl = el.parentNode,
      prevRow = parentEl.parentNode.previousElementSibling,
      briefId = $(prevRow).find('td.sorting_1').text();

    $('#form-container').append("<iframe src='https://docs.google.com/forms/d/e/1FAIpQLSeNG9fY0IUa1Q5dpR4ch6Zbjy1NSypPPFE17vKVD584aU1hLg/viewform?usp=pp_url&entry.1323381326&entry.1941186233=" + briefId + "' width='800' height='850' frameborder='0' marginheight='0' marginwidth='0'>Loading...</iframe>");
    $('#submit-edit').css('display', 'block');
    $('#close-edit-form').click(closeForm);
  }

  function closeForm() {
    $('#close-edit-form').unbind('click');
    $('#submit-edit').css('display', 'none');
    $('iframe').remove();
  }

  function displayMenu() {
    $("#display").on('change', function () {
      //$('#data-table').html('');
      var spinner = new Spinner(opts).spin(target);
      spinner.spin(target);
      var pageLength = $('#display').val();
      updateTable(0, pageLength);
      var uriHash = 'caseid=' + urlParams['caseid'];
      uriHash += '&minRange=' + urlParams['minRange'];
      uriHash += '&maxRange=' + urlParams['maxRange'];
      uriHash += '&and=' + urlParams['and'];
      uriHash += '&organizations=' + urlParams['organizations'];
      uriHash += '&pageNumber=' + 0;
      uriHash += '&pageLength=' + pageLength;
      window.location.hash = btoa(uriHash);
      return false;
    });
  }
});
