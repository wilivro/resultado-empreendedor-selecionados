var Service = (function($){
  'use strict';

  return {
    getStudents: function(){
      return $.when(
        $.getJSON('estudantes.json'),
        $.getJSON('estudantes-wiquadro.json')
      );
    }
  };
})(jQuery);

var Entrepreneur = (function($, Service) {
  'use strict';

  var $studentTable = $('.student-table');
  var $studentFilterField = $('#aluno');
  var $cityFilterField = $('#municipio');
  var $statusFilterField = $('#situacao');

  function studentTableRowTemplate(id, name, city, status) {
    return '<tr data-href="detalhes-aluno.html?id=' + id + '">' +
      '<td>' + name + '</td>' +
      '<td>' + city + '</td>' +
      '<td>' + status + '</td>' +
      '</tr>';
  }

  function getStatusByCode(code) {
    var statuses = [
      'Em Aberto',
      'Não Selecionado',
      'Selecionado para Premiação',
      'Selecionado para Crédito',
      'Finalista por Município',
      'Corrigido',
      'Não Enviado'
    ];

    return statuses[code];
  }

  function loadStudentTableWithData() {
    var $tableBody = $studentTable.find('tbody');

    Service.getStudents().done(function(glStudents, wiquadroStudents){
      glStudents = glStudents[0];
      wiquadroStudents = wiquadroStudents[0];

      $.each(glStudents.planos, function(i, row) {
        if (wiquadroStudents.hasOwnProperty(row.key)) {
          var student = wiquadroStudents[row.key];
          if (row.status === 2 || row.status === 3) {
            $tableBody.append(studentTableRowTemplate(student.chave, student.aluno, student.cidade, getStatusByCode(row.status)));
          }
          }
      });

      showTotalStudents();
    });
  }

  function showTotalStudents () {
    $('.totalRows').html($studentTable.find('tbody tr:visible').length);
  }

  function filterTable() {
    $studentTable.find('tbody tr').hide();

    $studentTable.find('tr')
      .filter(function(){
        var trText = $(this).text().toUpperCase();

        return trText.indexOf($studentFilterField.val().toUpperCase()) !== -1
          && trText.indexOf($cityFilterField.val().toUpperCase()) !== -1
          && trText.indexOf($statusFilterField.val().toUpperCase()) !== -1;
      }).show();

    showTotalStudents();
  }

  function onClickStudentTableRow() {
    window.location.href = $(this).data('href');
  }

  return {
    init: function() {
      loadStudentTableWithData();

      $studentTable.on('click', 'tbody tr', onClickStudentTableRow);
      $studentFilterField.on('keyup', $.debounce(300, filterTable));
      $cityFilterField.on('keyup', $.debounce(300, filterTable));
      $statusFilterField.on('change', $.debounce(300, filterTable));
    }
  };
})(jQuery, Service);

var StudentDetails = (function($, Service){
  'use strict';

  var $planoNegocioIframe = $('.plano-negocio');
  var $perfilEmpreendedorIframe = $('.perfil-empreendedor');
  var $notas = $('.notas');

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');

    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split('=');

      if (pair[0] == variable) {
        return pair[1];
      }
    }

    return(false);
  }

  function showStudentInfo(student) {
    $('.studentName').text(student.aluno);
    $('.teacherName').text(student.professor);
    $('.schoolName').text(student.escola);
  }

  function showStudentGrades(grades) {
    var $notasTableBody = $notas.find('table tbody');

    $.each(grades, function(i, grade){
      if (grade.media) {
        $notasTableBody.append('<tr><td>' + grade.disciplina + '</td><td>' + grade.media + '</td></tr>');
      }
    });
  }

  function setIframeSrc() {
    var studentId = getQueryVariable('id');

    $.ajaxSetup({
      beforeSend: function(xhr){
        xhr.overrideMimeType('text/html; charset=ISO-8859-1');
      }
    });

    $planoNegocioIframe.load('http://geralearning.wilivro.com.br/_admin/planos/visuglobalwiquadrocredito.asp?aluno=' + studentId);
    $perfilEmpreendedorIframe.attr('src', 'http://meuperfilempreendedor.com.br/?auth=x37J4jul3DGK7P51s4HjM1Xhvso6kifagPFV672r&user=' + studentId + '#/view?_k=dbrwh5');
  }

  return {
    init: function(){
      Service.getStudents().done(function(glStudents, wiquadroStudents){
        wiquadroStudents = wiquadroStudents[0];

        if (wiquadroStudents.hasOwnProperty(getQueryVariable('id'))) {
          var student = wiquadroStudents[getQueryVariable('id')];

          showStudentInfo(student);
          showStudentGrades(student.notas);
        }
      });

      setIframeSrc();
    }
  };
})(jQuery, Service);
