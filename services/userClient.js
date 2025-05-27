const http = require('http');

async function getRelationFromUserService(userId, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: ' "http://user', 
      port: 80,
      path: `/user/relation/${userId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', chunk => { data += chunk; });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed); 
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
