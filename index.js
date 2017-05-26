import google from 'googleapis'
import _ from 'lodash'
import mongodb from 'mongodb'
import mongoose from 'mongoose'
import colors from 'colors'
import R from 'ramda'

import credentials from './credentials.json'
import DB from './configs/db.json'
import Product from './models/product.js'

const MONGODB_URI = process.env.MONGODB_URI || `mongodb://localhost/ls-endowment`
let db

mongoose.connect(MONGODB_URI)
// Plugging in your own Promises Library using ES6 Promise
// Ref: http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise

db = mongoose.connection

db.on('error', (err) => {
  console.error('MongoDB connection error: ', err)
  process.exit(1)
})
db.on('open', () => {
  console.log('db connected')
  // let product = new Product()
  // product.age = '26'
  // product.gender = 'male'
  // product.ins_amount = '5000000'
  // product.ins_pay_period = '6'
  // product.ins_fee = '6000'
  // product.ins_fee_with_discount = '5555'
  // product.forfeit_fee_matrix = 'table~~'
  // product.save((err) => {
  //   if (err) {
  //     console.log('save error', err.message)
  //   } else {
  //   }
  // })


  // Product.find({age: '25'}, (err, p) => {
  //   if (err) {
  //     console.log('get error', err.message)
  //   } else {
  //     console.log('Product from db', JSON.stringify(p))
  //   }

  // })
})
const age_start = 30
const age_end = 40
const age_arr = _.range(age_start, age_end + 1, 1)
const gender = ['male', 'female']
const ins_amount_start = 5000
const ins_amount_end = 10000
const ins_amount_offset = 1000
const ins_pay_period = [null, 3, 6, 10]
const timer_interval = 0.5
const ins_amount_arr = _.range(ins_amount_start, ins_amount_end + ins_amount_offset, ins_amount_offset)
const query_matrix = R.pipe(
  R.xprod(age_arr),
  R.xprod(ins_amount_arr),
  R.xprod(ins_pay_period),
  R.map(R.flatten),
  R.map(R.zipObj(['ins_pay_period', 'ins_amount', 'age', 'gender'])),
)(gender)


// console.log('helloworld'.bgWhite.black, query_matrix)
let matrix_idx = 0
let timer = setInterval(() => {
  if (query_matrix[matrix_idx] === undefined) {
    clearInterval(timer)
  } else {
    setData(query_matrix[matrix_idx++])
  }
}, timer_interval * 1000)
function setData (dataset) {
  const { age, gender, ins_amount, ins_pay_period} = dataset
  console.log(`[age: ${age}, gender: ${gender}, ins_amount: ${ins_amount}, ins_pay_period: ${ins_pay_period === null ? '躉繳' : ins_pay_period + '年期'}] `.bgWhite.black)
}
const auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ['https://www.googleapis.com/auth/spreadsheets'],
  null
)

google.options({ auth })

const sheets = google.sheets('v4')
const spreadsheetId = '1yfwfh0StaFrvJuKyoJkMHojBFQcXAzcGXfys-LE-M70'

// sheets.spreadsheets.values.get({
//   spreadsheetId,
//   range: 'sheet_input!ins_product_BYA'
// }, (err, response) => {
//   console.log('==== initial values ====')
//   // console.log(response.values)
//   const ins_product = _.map(response.values, (val) => {
//     const ins_fee = parseInt(_.get(val, '[0]', 0).replace(/,/g, ''))
//     const rate = _.get(val, '[1]', null)
//     return ({ ins_fee, rate })
//   })
//   console.log(ins_product)
//
// })

// setTimeout(() => {
//   sheets.spreadsheets.values.update({
//     spreadsheetId,
//     range: 'sheet_input!ins_amount',
//     valueInputOption: 'USER_ENTERED',
//     includeValuesInResponse: true,
//     resource: {
//       values: [[ 10000 ]]
//     }
//
//   }, (err, response) => {
//     if (err) {
//       console.log('err', err)
//     } else {
//       console.log(`\nField ins_amount, ins_fee_calculated should update in 8 seconds. Check the difference. \n`)
//       setTimeout(() => {
//         sheets.spreadsheets.values.get({
//           spreadsheetId,
//           range: 'sheet_input!ins_product_USL7'
//         }, (err, response) => {
//           console.log('==== updated values ====')
//           const tmp = _.map(response.values, (val) => {
//             const ins_fee = parseInt(_.get(val, '[0]', 0).replace(/,/g, ''))
//             const rate = _.get(val, '[1]', null)
//             return ({ ins_fee, rate })
//           })
//           console.log(tmp)
//         })
//       }, 30000)
//     }
//   })
// }, 2000)


