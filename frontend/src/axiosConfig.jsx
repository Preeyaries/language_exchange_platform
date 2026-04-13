import axios from 'axios';

const axiosInstance = axios.create({
    //baseURL: 'http://localhost:5000', // local
<<<<<<< HEAD
    baseURL: 'http://3.27.235.128:5000', // live
=======
    baseURL: 'http://3.104.75.43:5000', // live
>>>>>>> f1d72f41640732fad97e6a8aa3b4f959781ba8c1
    headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
