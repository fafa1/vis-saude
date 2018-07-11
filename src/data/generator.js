// arquivo de geração e configuração das variaveis do json.
[
  {
    'repeat(5)': {
      _id: '{{objectId()}}',
      index: '{{index()}}',
      patient: function() {
        // Number of items in this array must equal the number of repeats above
        var patients = ['Veronica Hilster.', 'Diego C.', 'Charles W.', 'Maya D.', 'Tazeen K.'];
        return patients[this.indexh]; // obtendo o indice de cada paciente
      },
      years: [
        {
          'repeat(3)': {
            index: '{{index()}}',
            year: function() {
              return 2018 - this.index;
            },
            months: [
              {
                'repeat(12)': {
                  index: '{{index()}}',
                  month: function() { // retorna todos os meses
                    return this.index + 1;
                  },
                  monthName: function() {
                    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                    return months[this.index]; // retorna o indice de cada mes (nome)
                  },
                  values: [
                    {
                      'repeat(7)': {
                        index: '{{index()}}',
                        measure: function() {
                          // Number of items in this array must equal the number of repeats above
                          var measures = ['Behavior', 'Social Circumstances', 'Genetics & Biology', 'Medical Care', 'Health Literacy', 'Access', 'Environment'];
                          return measures[this.index]; // retorna os indices das medições
                        },
                        value: '{{floating(0.15, 1.00)}}' //valores entre 0.15 e 1.00
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  }
]
