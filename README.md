# IRR Project

## Requirements

Node version: ^6.0.0

MongoDB

## How to run

``` 
npm install
npm start
```

## DB schema


|  	| Type 	| Description 	|  	
|--------	|------	|-------------	|
| _id 	|String  	|  	|  
| age 	|String  	|儲蓄險商品組合年齡	|  	 
| ins_id 	|String  	|儲蓄險商品代號  	|  
| ins_amount 	|String  	|儲蓄險商品組合保額  	|  
| ins_pay_period 	|String  	|儲蓄險商品組合繳費年期  	|  
| ins_fee 	|String  	|儲蓄險商品組合保費  	|  
| ins_fee_with_discount 	|String  	|儲蓄險商品組合保費（折扣後）  	|  
| forfeit_fee_matrix 	|String  	|解約金與年紀對照表  	|  
| created_at 	|Date  	|建立時間  	|  
| updated_at 	|Date  	|更新時間  	|  
