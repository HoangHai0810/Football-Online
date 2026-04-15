const axios = require('axios');

(async () => {
   try {
      console.log("Registering test user...");
      const res = await axios.post('http://localhost:8080/api/auth/register', {
        username: 'crash_test_' + Math.floor(Math.random()*1000), 
        password: 'password', 
        email: 'test' + Math.floor(Math.random()*1000) + '@a.com'
      });
      
      console.log("Token received:", res.data.token ? "YES" : "NO");
      const userId = res.data.user.id;
      const token = res.data.token;
      
      console.log("Calling tournaments API...");
      const tRes = await axios.get('http://localhost:8080/api/career/tournaments?userId=' + userId, {
          headers: { Authorization: `Bearer ${token}` }
      });
      console.log("SUCCESS:", tRes.data);
   } catch(e) {
      if (e.response) {
         console.log("ERROR:", e.response.data);
      } else {
         console.log("FETCH ERROR:", e.message);
      }
   }
})();
