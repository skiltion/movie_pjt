const XLSX = require('xlsx');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 엑셀 파일 경로
const excelFilePath = path.join(__dirname, 'movies.xlsx');

// 엑셀 파일을 읽음
const workbook = XLSX.readFile(excelFilePath);
const sheetName = workbook.SheetNames[0]; // 첫 번째 시트 읽기
const sheet = workbook.Sheets[sheetName];

// 시트 데이터를 JSON으로 변환
const movieData = XLSX.utils.sheet_to_json(sheet);

// SQLite DB 연결
const db = new sqlite3.Database('movies.db', (err) => {
  if (err) {
    console.error('데이터베이스 연결 실패:', err.message);
  } else {
    console.log('데이터베이스 연결 성공');
  }
});

// 테이블 생성
db.run(`
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_title TEXT,
    overview TEXT,
    release_date TEXT,
    poster_path TEXT,
    backdrop_path TEXT,
    popularity REAL,
    vote_average REAL,
    vote_count INTEGER
  )
`, (err) => {
  if (err) {
    console.error('테이블 생성 실패:', err.message);
  } else {
    console.log('테이블 생성 성공');
  }
});

// 데이터 삽입
const insertQuery = `
  INSERT INTO movies (original_title, overview, release_date, poster_path, backdrop_path, popularity, vote_average, vote_count)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

movieData.forEach((movie) => {
  const {
    'Original Title': originalTitle,
    Overview: overview,
    'Release Date': releaseDate,
    'Poster Path': posterPath,
    'Backdrop Path': backdropPath,
    Popularity: popularity,
    'Vote Average': voteAverage,
    'Vote Count': voteCount
  } = movie;

  db.run(insertQuery, [
    originalTitle, overview, releaseDate, posterPath, backdropPath, popularity, voteAverage, voteCount
  ], (err) => {
    if (err) {
      console.error('데이터 삽입 오류:', err.message);
    }
  });
});

const createCommentsTable = `
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies (id)
  );
`;

db.run(createCommentsTable, (err) => {
  if (err) {
    console.error('테이블 생성 실패:', err.message);
  } else {
    console.log('comments 테이블 생성 완료');
  }
});

// 데이터베이스 연결 종료
db.close((err) => {
  if (err) {
    console.error('데이터베이스 종료 오류:', err.message);
  } else {
    console.log('데이터베이스 종료');
  }
});
