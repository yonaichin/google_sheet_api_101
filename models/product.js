import mongoose from 'mongoose'

let ProductSchema = new mongoose.Schema({
  age: String,
  gender: String,
  ins_id: String,
  ins_amount: String,
  ins_pay_period: String,
  ins_fee: String,
  ins_fee_with_discount: String,
  forfeit_fee_matrix: String,
  created_at: Date,
  updated_at: Date
})

// use function insteat of => to bind this
// ref: http://stackoverflow.com/questions/37365038/this-is-undefined-in-a-mongoose-pre-save-hook
ProductSchema.pre('save', function (next) {
  let st = this
  if (!st.created_at) {
    st.created_at = new Date()
  } else {
    st.updated_at = new Date()
  }
  next()
})

export default mongoose.model('Product', ProductSchema)


