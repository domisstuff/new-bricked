// /api/battery/connection/get.js
export default function handler(req, res) {
  const postData = global.postData || null;
  const connected = postData ? true : false;
  res.status(200).json({ connected, postData });
}
