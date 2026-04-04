import axios from 'axios';

const axiosInstance = axios.create({
    //baseURL: 'http://localhost:5000', // local
    baseURL: 'http://3.104.75.43/:5000', // live
    headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
