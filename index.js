const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const PORT = 3000;
const cors = require('cors');
app.use(cors());

const db = new sqlite3.Database('movies.db', (err) => {
    if (err) {
      console.error('데이터베이스 연결 실패:', err.message);
    }
  });
  

app.listen(PORT, ()=> {
    console.log(`서버가 http://localhost:${PORT} 에서 실행중입니다.`)
})

// /movies API 엔드포인트
app.get('/movies', (req, res) => {
    // 쿼리문: 필요한 칼럼만 선택
    const query = `SELECT id, original_title, poster_path, vote_average FROM movies`;
  
    // 데이터베이스에서 영화 리스트를 가져옴
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('데이터베이스 쿼리 실패:', err.message);
        return res.status(500).send('서버 오류');
      }
  
      // 성공적으로 데이터를 가져왔다면 JSON으로 응답
      res.json(rows);
    });
  });