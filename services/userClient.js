const http = require('http');

async function getRelationFromUserService(userId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'user-service', // Docker 환경에서 user-service 컨테이너 이름
      port: 3002,
      path: `/user/relation/${userId}`,
      method: 'GET',
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

module.exports = { getRelationFromUserService };
