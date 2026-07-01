import psycopg2

conn = psycopg2.connect('dbname=postgres user=postgres password=postgres host=127.0.0.1')
conn.autocommit = True
cur = conn.cursor()
try:
    cur.execute('CREATE DATABASE hr_ai_platform')
    print('✅ Database created successfully!')
except psycopg2.errors.DuplicateDatabase:
    print('✅ Database already exists')
    
cur.close()
conn.close()

# Test connection to new database
conn2 = psycopg2.connect('dbname=hr_ai_platform user=postgres password=postgres host=127.0.0.1')
print('✅ Connection to hr_ai_platform successful!')
conn2.close()
