async function selectCommunity(pool, boardId) {
    const selectBoardQuery = `
        SELECT *
        FROM board
        WHERE board_id = ?`;

    const [boardRows] = await pool.query(selectBoardQuery, [boardId]);

    const list = boardRows.length > 0 ? boardRows.map(row => {
        // UTC -> KST 변환
        const updatedAtKST = new Date(row.updated_at).toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });

        return {
            category_name: row.category_name,
            user_id: row.user_id,
            board_id: row.board_id,
            title: row.title,
            content: row.content,
            updated_at: updatedAtKST,
            views: row.views,
            relation_reveal: row.relation_reveal
        };
    }) : [];

    console.log("list:", list);
    return list;
}

async function selectMyPost(pool, user_id) {
  const selectMyPostQuery = `
    SELECT title, board_id
    FROM board
    WHERE user_id = ?
  `;
  const [userPostingRow] = await pool.query(selectMyPostQuery, [user_id]);
  const list = userPostingRow.length > 0 ? userPostingRow.map(row => ({
    board_id : row.board_id,
    title : row.title
  })) : [];
  return list;
}

async function selectOtherPost(pool, user_id) {
  const selectCommunityQuery = `
    SELECT title, board_id
    FROM board
    WHERE user_id != ?
  `;
  const [communityPosts] = await pool.query(selectCommunityQuery, [user_id]);
  const list = communityPosts.length > 0 ? communityPosts.map(row => ({
    board_id : row.board_id,
    title : row.title
  })) : [];
  return list;
}

async function selectComment(pool, boardId) {
  const selectCommentQuery = `
  SELECT *
  FROM reply
  WHERE board_id = ?`;
      
  const [commentRows] = await pool.query(selectCommentQuery, [boardId]);
  
  const list = commentRows.length > 0 ? commentRows.map(row => ({
    category_name : row.category_name, 
    board_id : row.board_id,
    reply_id : row.reply_id,
    content : row.content,
    parent_id : row.parent_id,
    user_id : row.user_id,
  })) : [];
  console.log("comment:",list);
  return list;
}

// 조회수 update
async function incrementViewsCount(pool, boardId) {
  const updateViewsCountQuery = `
      UPDATE board
      SET views = views + 1
      WHERE board_id = ?`;

  const [viewRows] = await pool.query(updateViewsCountQuery, [boardId]);
  return viewRows;
}

// get 고민상담소 리스트
async function getWorryList(pool, user_id, page) {
  const ITEMS_PER_PAGE = 9; // 한 페이지에 보여줄 게시글 수

  const pageNumber = page;
  const offset = (pageNumber - 1) * ITEMS_PER_PAGE;
  const getListQuery = `
    SELECT board_id, title, updated_at, views
    FROM board
    WHERE category_name = '자유게시판'
    ORDER BY board_id DESC
    LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset};
  `;

  const [listRows] = await pool.query(getListQuery);

  const list = listRows.length > 0 ? listRows.map(row => ({
     board_id : row.board_id,
     title: row.title,
     updated_date: formatDate(row.updated_at),
     updated_time: formatTime(row.updated_at),
     views: row.views
  })) : [];

  return list;
}

// get my 고민상담소 리스트
async function getMyWorryList(pool, user_id, page) {
  const ITEMS_PER_PAGE = 7; // 한 페이지에 보여줄 게시글 수

  const pageNumber = page;
  const offset = (pageNumber - 1) * ITEMS_PER_PAGE;
  const getListQuery = `
    SELECT board_id, title, updated_at, views
    FROM board
    WHERE category_name = '자유게시판' AND user_id = ?
    ORDER BY board_id DESC
    LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset};
  `;

  const [listRows] = await pool.query(getListQuery, [user_id]);

  const list = listRows.length > 0 ? listRows.map(row => ({
     board_id : row.board_id,
     title: row.title,
     updated_date: formatDate(row.updated_at),
     updated_time: formatTime(row.updated_at),
     views: row.views
  })) : [];

  return list;
}

function formatDate(dateTimeString) {
  const date = new Date(dateTimeString);
  date.setHours(date.getHours() + 9); // UTC → KST 변환
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // 예: "2025-06-04"
}

function formatTime(dateTimeString) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  });

  const date = new Date(dateTimeString);
  return formatter.format(date); // 예: "13:45"
}

async function insertBoardInfo(pool, insertBoardParams){
  const insertBoardQuery = `
    INSERT INTO board (category_name, user_id, title, content, updated_at, views, relation_reveal) 
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `;
  
  const connection = await pool.getConnection();
  try {
      await connection.query(insertBoardQuery, insertBoardParams);
  } catch (error) {
      console.log(error);
      throw error;
  } finally {
      connection.release();
  }
}  

async function insertCommentInfo(pool, insertCommentParams){
  const insertCommentQuery = `
    INSERT INTO reply (user_id, category_name, board_id, content, parent_id) 
    VALUES (?, ?, ?, ?, NULL);
  `;

  const connection = await pool.getConnection();

  try {
    await connection.query(insertCommentQuery, insertCommentParams);
  } catch (error) {
      console.log(error);
      throw error;
  } finally {
      connection.release();
  }
}

// get 정보공유 리스트
async function getInfoList(pool, user_id, page) {
  const ITEMS_PER_PAGE = 9;

  const pageNumber = page;
  const offset = (pageNumber - 1) * ITEMS_PER_PAGE;
  const getListQuery = `
    SELECT board_id, title, updated_at, views
    FROM board
    WHERE category_name = '정보게시판'
    ORDER BY board_id DESC
    LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset};
  `;

  const [listRows] = await pool.query(getListQuery);

  const list = listRows.length > 0 ? listRows.map(row => ({
     board_id : row.board_id,
     title: row.title,
     updated_date: formatDate(row.updated_at),
     updated_time: formatTime(row.updated_at),
     views: row.views
  })) : [];

  return list;
}

// get my 정보공유 리스트
async function getMyInfoList(pool, user_id, page) {
  const ITEMS_PER_PAGE = 7;

  const pageNumber = page;
  const offset = (pageNumber - 1) * ITEMS_PER_PAGE;
  const getListQuery = `
    SELECT board_id, title, updated_at, views
    FROM board
    WHERE category_name = '정보게시판' AND user_id = ?
    ORDER BY board_id DESC
    LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset};
  `;

  const [listRows] = await pool.query(getListQuery, [user_id]);

  const list = listRows.length > 0 ? listRows.map(row => ({
     board_id : row.board_id,
     title: row.title,
     updated_date: formatDate(row.updated_at),
     updated_time: formatTime(row.updated_at),
     views: row.views
  })) : [];

  return list;
}

module.exports = {
  insertBoardInfo,
  selectComment,
  insertCommentInfo,
  incrementViewsCount,
  getWorryList,
  getMyWorryList,
  getInfoList,
  getMyInfoList,
  selectCommunity,
  selectMyPost,
  selectOtherPost
};
