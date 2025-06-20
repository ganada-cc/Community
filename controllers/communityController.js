const communityService = require('../services/communityService');
const jwt = require('jsonwebtoken');
const baseResponse = require("../config/baseResponseStatus");
const path = require('path');
const querystring = require('querystring');

// 게시글 세부 조회 + 댓글 조회
exports.getCommunity = async function (req, res) {
    const user_id = req.headers['x-user-id'];

    if (!user_id) {
        console.log('⚠️ x-user-id 헤더가 없습니다!');
        return res.send(baseResponse.USER_USERIDX_EMPTY);
    }

    const board_id = req.params.board_id;
    const title = req.params.title;
    // const communityResult = await communityService.retrieveCommunity(board_id, token);
    const communityResult = await communityService.retrieveCommunity(board_id, user_id);
    
    const commentResult = await communityService.retrieveComment(board_id, title);
    const myPostResult = await communityService.retriveMyPost(user_id);
    // 자신의 게시물 개수 제한 7개
    const limitedPosts = myPostResult.slice(0, 7);
    const otherPostResult = await communityService.retrieveOtherPost(user_id);
    // 다른 사람의 게시물 개수 제한 13개
    const limitedOtherPosts = otherPostResult.slice(0, 13);

    // Combine communityResult and commentResult as needed before rendering the view
    const combinedData = {
        communityResult: communityResult,
        commentResult: commentResult,
        myPostResult: limitedPosts,
        otherPostResult: limitedOtherPosts,
    };
    await communityService.updateViewsCount(board_id);
    console.log("combinedData", combinedData);
    //console.log(communityResult.title);
    return res.render('community/commun_view.ejs', combinedData);
}

exports.getWrite = async function (req, res) {
    const user_id = req.headers['x-user-id'];

    if (!user_id) {
        console.log('⚠️ x-user-id 헤더가 없습니다!');
        return res.send(baseResponse.USER_USERIDX_EMPTY);
    }
    
    const board_id = req.params.board_id;
    const title = req.params.title;
    // 나의 게시물
    const myPostResult = await communityService.retriveMyPost(user_id); 
    const limitedPosts = myPostResult.slice(0, 7);
    // 다른 사람 게시물
    const otherPostResult = await communityService.retrieveOtherPost(user_id, board_id, title);
    const limitedOtherPosts = otherPostResult.slice(0, 13);

    const combinedData = {
        myPostResult: limitedPosts,
        otherPostResult: limitedOtherPosts
    };
    //console.log("combinedData", combinedData);
    //console.log(communityResult.title);

    // 화면 크기에 따라 적절한 템플릿 파일 렌더링
    const userAgent = req.headers['user-agent'];

    if (userAgent.includes('Mobile')) {
        // 모바일 화면일 경우 mobile.ejs 렌더링
        return res.render('community/mobile_commun_write.ejs', combinedData);
    } else {
        // 데스크탑 화면일 경우 desktop.ejs 렌더링
        return res.render('community/commun_write.ejs', combinedData);
    }
}

// 게시글 고민상담소 리스트 조회
exports.getWorryList = async function (req, res) {
    const user_id = req.headers['x-user-id'];

    if (!user_id) {
        console.log('⚠️ x-user-id 헤더가 없습니다!');
        return res.send(baseResponse.USER_USERIDX_EMPTY);
    }

    try {
        if (!req.query.page || !req.query.page1) {
          return res.redirect(`${req.originalUrl}?page=1&page1=1`);
        }
        let page = req.query.page;
        let page1 = req.query.page1;
        const communityDataResult = await communityService.retrieveWorryCommunity(
            user_id,
            page
        );
        console.log(communityDataResult);
        const communityMyDataResult = await communityService.retrieveMyWorryCommunity(
            user_id,
            page1
        );
        console.log(communityMyDataResult);

        const combinedData = {
            communityDataResult: communityDataResult,
            communityMyDataResult: communityMyDataResult
        };

        return res.render('community/community1.ejs', combinedData);
    } catch (err) {
        return res.send('Error occurred during token verification or community retrieval.');
    }
};

// 게시글 정보공유 리스트 조회
exports.getInfoList = async function (req, res) {
    const user_id = req.headers['x-user-id'];

    if (!user_id) {
        console.log('⚠️ x-user-id 헤더가 없습니다!');
        return res.send(baseResponse.USER_USERIDX_EMPTY);
    }

    try {
        if (!req.query.page || !req.query.page1) {
         return res.redirect(`${req.originalUrl}?page=1&page1=1`);
        }
        let page = req.query.page;
        let page1 = req.query.page1;
        const communityDataResult = await communityService.retrieveInfoCommunity(
            user_id,
            page
        );
        console.log(communityDataResult);
        const communityMyDataResult = await communityService.retrieveMyInfoCommunity(
            user_id,
            page1
        );
        console.log(communityMyDataResult);

        const combinedData = {
            communityDataResult: communityDataResult,
            communityMyDataResult: communityMyDataResult
        };

        return res.render('community/community2.ejs', combinedData);
    } catch (err) {
        return res.send('Error occurred during token verification or community retrieval.');
    }
};

// side 게시글 조회 (다른 게시글 보기)
exports.getComment = async function (req, res) {
    const board_id = req.params.board_id;
    const title = req.params.title;
    const commentResult = await communityService.retrieveSide(board_id, title);
    console.log(commentResult);
    //console.log(communityResult.title);
    return res.render('community/side.ejs', { commentResult: commentResult});
};

// 게시글 작성
exports.postBoard = async function (req, res) {
    const user_id = req.headers['x-user-id'];

    if (!user_id) {
        console.log('⚠️ x-user-id 헤더가 없습니다!');
        return res.send(baseResponse.USER_USERIDX_EMPTY);
    }

    var updated_at = new Date(); 
    console.log(updated_at);

    const {
        category_name,
        title,
        content,
        relation_reveal: relation_revealRaw // 변수 이름 변경
    } = req.body;

    const relation_reveal = relation_revealRaw === "true" ? 1 : 0;

    const createCommunResponse = await communityService.createBoard(
        category_name,
        user_id,
        title,
        content,
        updated_at,
        relation_reveal
    );
    if (createCommunResponse == "성공") {
        if (category_name == "정보게시판"){
            return res.status(200).send(`
                <script>
                    if (confirm('게시글 등록에 성공했습니다.')) {
                        window.location.href = "/community/infoList";
                    }
                </script>
            `);
        }
        else{
            return res.status(200).send(`
                <script>
                    if (confirm('게시글 등록에 성공했습니다.')) {
                        window.location.href = "/community/worryList";
                    }
                </script>
            `);
        }
        
    } else {
        return res.send(`
            <script>
                if (confirm('게시글 등록에 실패했습니다.')) {
                    window.location.href = "/community/infoList";
                }
            </script>
        `);
    }
};

exports.postComment = async function (req, res) {
    const user_id = req.headers['x-user-id'];
    // console.log(req.body);
    // var updated_at = new Date(); 
    // console.log(updated_at);

    const {
        category_name,
        board_id,
        content
    } = req.body;
    // console.log(req.body.content);
    const createCommentResponse = await communityService.createComment(
        user_id,
        category_name,
        board_id,
        content,
        0
    );
    if (createCommentResponse == "성공") {
        return res.status(200).send(`
            <script>
                if (confirm('댓글 등록에 성공했습니다.')) {
                    const board_id = ${req.body.board_id}; 
                    window.location.href = "/community/write/" + board_id;
                }
            </script>
        `);
    } else {
        return res.send(`
            <script>
                if (confirm('댓글 등록에 실패했습니다.')) {
                    const board_id = ${req.body.board_id}; 
                    window.location.href = "/community/write/" + board_id;
                }
            </script>
        `);
    }
};
