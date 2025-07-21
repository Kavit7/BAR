import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3000/logout', {
      method: 'GET',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.removeItem('loggedIn');
          Swal.fire({
            icon: 'success',
            title: 'Logged out successfully',
            showConfirmButton: false,
            timer: 1500
          });
          navigate('/');
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Logout failed',
            text: data.message || 'Try again later.'
          });
        }
      })
      .catch(err => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Something went wrong during logout.'
        });
        console.error(err);
      });
  }, [navigate]);

  return null;
};

export default Logout;
