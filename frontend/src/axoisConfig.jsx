import axios from 'axios';

const axiosInstance = axios.create({
    //baseURL: 'http://localhost:5000', // local
    baseURL: 'http://3.24.242.2:5000', // live
    headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;