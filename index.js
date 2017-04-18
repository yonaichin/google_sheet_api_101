const google      = require('googleapis');
const credentials = require('./credentials.json');

const auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ['https://www.googleapis.com/auth/spreadsheets'],
  null
)

google.options({ auth })

const sheets = google.sheets('v4')
const spreadsheetId = '1EPz9qJO5RLYXhLiCZtVTdDVo-vLeozhGqmeR4lPc-aY'

sheets.spreadsheets.values.get({
  spreadsheetId,
  range: 'sheet1!ins_datas'
}, (err, response) => {
  console.log('==== initial values ====')
  console.log(response.values)
})

sheets.spreadsheets.values.update({
  spreadsheetId,
  range: 'sheet1!B2',
  valueInputOption: 'USER_ENTERED',
  includeValuesInResponse: true,
  resource: {
    values: [['500']]
  }

}, (err, response) => {
  if (err) {
    console.log('err', err)
  } else {
    console.log(`\nField ins_amount should update in 8 seconds. Check the difference. \n`)
    setTimeout(() => {
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'sheet1!ins_datas'
      }, (err, response) => {
        console.log('==== updated values ====')
        console.log(response.values)
      })
    }, 8000)
  }
})


