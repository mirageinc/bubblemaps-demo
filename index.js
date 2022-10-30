import postgres from "postgres"    
import "dotenv/config"    
    
    
const sql = postgres(process.env.DATABASE_URI, { transform: postgres.camel });    
    
const res = await sql`select address from ethereum.account limit 150`    
const wallets = res.map(({address}) => address)    
    
    
const start = performance.now()
const transactions = await sql`    
select    
  *    
from    
  unnest('{${sql(wallets)}}'::citext []) as w (address)    
  cross join lateral (    
    select    
      *    
    from    
      ethereum.transaction as t    
    where    
      t.sender = w.address    
    order by    
      block_number desc,    
      index desc    
    limit 100   
    ) as t 
`    

const end = performance.now()

console.log(transactions)
console.log(`${transactions.length} transactions fetched in ${end - start}ms`)

await sql.end()
process.exit(1)
