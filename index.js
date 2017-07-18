import fs from 'fs'
import google from 'googleapis'
import _ from 'lodash'
import mongodb from 'mongodb'
import mongoose from 'mongoose'
import colors from 'colors'
import R from 'ramda'
import stringFormat from 'stringformat.js'

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
})
const age_start = 30
const age_end = 40
const age_arr = _.range(age_start, age_end + 1, 1)
const gender = ['male', 'female']
const ins_amount_start = 5000
const ins_amount_end = 2000000
const ins_amount_offset = 1000
const ins_pay_period = [null, 3, 6, 10]
const timer_interval = 40
const ins_amount_arr = _.range(ins_amount_start, ins_amount_end + ins_amount_offset, ins_amount_offset)
const query_matrix = R.pipe(
  R.xprod(age_arr),
  R.xprod(ins_amount_arr),
  R.xprod(ins_pay_period),
  R.map(R.flatten),
  R.map(R.zipObj(['ins_pay_period', 'ins_amount', 'age', 'gender'])),
)(gender)


let matrix_idx = 0

fs.readFile(`${__dirname}/matrix_idx.txt`, 'utf8', (err, idx) => {

  if (err) {
    console.log('Cannot found matrix_idx.txt. Start from index 0.')
  } else {
    matrix_idx = idx
  }
  let timer = setInterval(() => {
    if (query_matrix[matrix_idx] === undefined) {
      clearInterval(timer)
    } else {
      fs.writeFile(`${__dirname}/matrix_idx.txt`, matrix_idx, (err) => {
        if (err) return console.log('write idx error', err)
      })
      setData(query_matrix[matrix_idx++])
      console.log(`Status: ${matrix_idx}/${query_matrix.length}, ETA: ${stringFormat.secondsToHHMMSS((query_matrix.length - matrix_idx) * timer_interval)}`)
    }
  }, timer_interval * 1000)
})

const today = new Date()
function setData (dataset) {
  const { age, gender, ins_amount, ins_pay_period} = dataset
  console.log(`[age: ${age}, gender: ${gender}, ins_amount: ${ins_amount}, ins_pay_period: ${ins_pay_period === null ? '躉繳' : ins_pay_period + '年期'}] `.bgWhite.black)
  updateGoogleDocValues('gender', gender === 'male' ? '男' : '女')
  updateGoogleDocValues('ins_amount', ins_amount)
  updateGoogleDocValues('ins_pay_period', ins_pay_period)
  updateGoogleDocValues('birthday_year', today.getFullYear() - age - 1911 )
  updateGoogleDocValues('birthday_month', today.getMonth() + 1)
  updateGoogleDocValues('birthday_day', today.getDate())
  // ins_id USL7
  Promise.all([
      getGoogleDocValues('ins_fee_USL7'),
      getGoogleDocValues('ins_fee_with_discount_USL7'),
      getGoogleDocValues('ins_product_USL7'),
    ])
    .then((results) => {
      const ins_fee = results[0][0]
      const ins_fee_with_discount = results[1][0]
      const forfeit_fee_matrix = JSON.stringify(results[2])
      console.log(`ins_fee: ${ins_fee}, ins_fee_with_discount: ${ins_fee_with_discount}`)
      // save to db start
      let product = new Product()
      product.age = age
      product.gender = gender
      product.ins_amount = ins_amount
      product.ins_pay_period = ins_pay_period
      product.ins_fee = ins_fee
      product.ins_fee_with_discount = ins_fee_with_discount
      product.forfeit_fee_matrix = forfeit_fee_matrix
      product.ins_id = 'USL7'
      product.save((err) => {
        if (err) {
          console.log('save error', err.message)
        } else {
        }
      })
      // save to db ends
    })
    .catch((err) => {
      console.log('err', err)
    })
  // ins_id BYA
  Promise.all([
      getGoogleDocValues('ins_fee_BYA'),
      getGoogleDocValues('ins_fee_with_discount_BYA'),
      getGoogleDocValues('ins_product_BYA'),
    ])
    .then((results) => {
      const ins_fee = results[0][0]
      const ins_fee_with_discount = results[1][0]
      const forfeit_fee_matrix = JSON.stringify(results[2])
      console.log(`ins_fee: ${ins_fee}, ins_fee_with_discount: ${ins_fee_with_discount}`)
      // save to db start
      let product = new Product()
      product.age = age
      product.gender = gender
      product.ins_amount = ins_amount
      product.ins_pay_period = ins_pay_period
      product.ins_fee = ins_fee
      product.ins_fee_with_discount = ins_fee_with_discount
      product.forfeit_fee_matrix = forfeit_fee_matrix
      product.ins_id = 'BYA'
      product.save((err) => {
        if (err) {
          console.log('save error', err.message)
        } else {
        }
      })
      // save to db ends
    })
    .catch((err) => {
      console.log('err', err)
    })
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
const spreadsheetId = '14cI4jC3DM8D4oyHCUyxAkvVXw6afPYIxqGC5yfWPzco'

function getGoogleDocValues (attr) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `sheet_input!${attr}`
      }, (err, response) => {
        if (err) {
          reject(err)
        }
        if (attr.indexOf('ins_product') > -1) {
          resolve(response.values)
        } else {
          const res = response.values.map(([v]) => v)
          resolve(res)
        }

      })
    }, (timer_interval - 2) * 1000)
  })
}
function updateGoogleDocValues (attr, value) {
  sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `sheet_input!${attr}`,
    valueInputOption: 'USER_ENTERED',
    includeValuesInResponse: true,
    resource: {
      values: [[ value ]]
    }
  }, (err, response) => {
    if (err) {
      console.log(`update [${attr}] failed.`, err)
    }
  })
}


