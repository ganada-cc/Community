const http = require('http');

async function getRelationFromUserService(userId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'user',
      port: 80,
      path: `/users/relation/${userId}`,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          console.log('user-service 응답:', data); // 여기서 응답 로그 출력
          const parsed = JSON.parse(data);
          resolve(parsed.relationship);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// const axios = require('axios');

// async function getRelationFromUserService(userId, token) {
//   try {
//     const response = await axios.get(`http://user:3002/user/relation/${userId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`, // 필요하면 토큰 포함
//       }
//     });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// }


module.exports = { getRelationFromUserService };
