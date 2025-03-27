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

// 영화 상세 정보 API 엔드포인트
app.get('/movies/:id', (req, res) => {
    const movieId = req.params.id;
    const query = `SELECT * FROM movies WHERE id = ?`;
  
    db.get(query, [movieId], (err, row) => {
      if (err) {
        console.error('영화 상세 정보를 가져오는 데 실패했습니다:', err.message);
        return res.status(500).send('서버 오류');
      }
  
      if (row) {
        res.json(row);
      } else {
        res.status(404).send('영화 정보를 찾을 수 없습니다.');
      }
    });
  });

// 댓글 작성 API
app.post('/movies/:id/comments', express.json(), (req, res) => {
    const movieId = req.params.id;
    const { username, content } = req.body;
  
    if (!username || !content) {
      return res.status(400).send('사용자 이름과 댓글 내용을 모두 입력해야 합니다.');
    }
  
    const query = `INSERT INTO comments (movie_id, username, content) VALUES (?, ?, ?)`;
  
    db.run(query, [movieId, username, content], function (err) {
      if (err) {
        console.error('댓글 저장 실패:', err.message);
        return res.status(500).send('서버 오류');
      }
  
      res.status(201).send({ id: this.lastID, movieId, username, content, created_at: new Date() });
    });
  });

// 영화의 댓글을 가져오는 API
// 영화의 댓글을 가져오는 API
app.get('/movies/:id/comments', (req, res) => {
    const movieId = req.params.id;
  
    const query = `SELECT * FROM comments WHERE movie_id = ? ORDER BY created_at DESC`;
  
    db.all(query, [movieId], (err, rows) => {
      if (err) {
        console.error('댓글을 가져오는 데 실패했습니다:', err.message);
        return res.status(500).send('서버 오류');
      }
  
      res.json(rows);
    });
  });
  