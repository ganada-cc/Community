const pool = require('../main');
const communityModel = require('../models/communityModel');
const userClient = require('./userClient');

// 게시글 조회
exports.retrieveCommunity = async function (boardId) {
    const community = await communityModel.selectCommunity(pool, boardId);
    if (!community || community.length === 0) return null;

    const post = community[0];

    let relationInfo = null;
    if (post.relation_reveal) {
        try {
            relationInfo = await userClient.getRelationFromUserService(post.user_id);
        } catch (err) {
            console.error('user-service 호출 실패:', err.message);
        }
    }

    return {
        ...post,
        relation_info: relationInfo
    };
};

// 내가 쓴 글 전체 조회
exports.retriveMyPost = async function (user_id) {
    const myPostResult = await communityModel.selectMyPost(pool, user_id);
    console.log(myPostResult);
    return myPostResult;
};

// 다른 사람이 쓴 글 전체 조회
exports.retrieveOtherPost = async function (user_id, board_id, title) {
    try {
        const communityPosts = await communityModel.selectOtherPost(pool, user_id, board_id, title);
        return communityPosts;
    } catch (error) {
        console.error("Error retrieving community posts: ", error);
        throw error;
    }
};

// 조회수 업데이트
exports.updateViewsCount = async function (board_id) {
    try {
        await communityModel.incrementViewsCount(pool, board_id);
    } catch (err) {
        console.error('Error updating views count:', err);
    }
};

// 댓글 조회
exports.retrieveComment = async function (board_id) {
    const commentResult = await communityModel.selectComment(pool, board_id);
    return commentResult;
};

// 고민상담소 게시판 리스트
exports.retrieveWorryCommunity = async function (user_id, page) {
    try {
        const communityDataResult = await communityModel.getWorryList(pool, user_id, page);
        console.log(communityDataResult);
        return communityDataResult;
    } catch (err) {
        console.log(err);
        return 'retrieveSelectedCommunityError';
    }
};

// 정보 공유 게시판 리스트
exports.retrieveInfoCommunity = async function (user_id, page) {
    try {
        const communityDataResult = await communityModel.getInfoList(pool, user_id, page);
        console.log(communityDataResult);
        return communityDataResult;
    } catch (err) {
        console.log(err);
        return 'retrieveSelectedCommunityError';
    }
};

// 나의 고민상담소 게시판 리스트
exports.retrieveMyWorryCommunity = async function (user_id, page) {
    try {
        const communityMyDataResult = await communityModel.getMyWorryList(pool, user_id, page);
        console.log(communityMyDataResult);
        return communityMyDataResult;
    } catch (err) {
        console.log(err);
        return 'retrieveSelectedCommunityError';
    }
};

// 나의 정보게시판 리스트
exports.retrieveMyInfoCommunity = async function (user_id, page) {
    try {
        const communityMyDataResult = await communityModel.getMyInfoList(pool, user_id, page);
        console.log(communityMyDataResult);
        return communityMyDataResult;
    } catch (err) {
        console.log(err);
        return 'retrieveSelectedCommunityError';
    }
};

// 게시글 작성
exports.createBoard = async function (
    category_name,
    user_id,
    title,
    content,
    updated_at,
    relation_reveal
) {
    try {
        const insertBoardParams = [
            category_name,
            user_id,
            title,
            content,
            updated_at,
            0, // 조회수 초기값,
            relation_reveal

        ];

        await communityModel.insertBoardInfo(pool, insertBoardParams);
        return '성공';
    } catch (err) {
        console.error('게시글 작성 실패:', err);
        return err;
    }
};

// 댓글 작성
exports.createComment = async function (
    user_id,
    category_name,
    board_id,
    content,
    parent_id
) {
    try {
        const insertCommentParams = [
            user_id,
            category_name,
            board_id,
            content,
            parent_id
        ];

        await communityModel.insertCommentInfo(pool, insertCommentParams);
        return '성공';
    } catch (err) {
        console.error('댓글 작성 실패:', err);
        return err;
    }
};
