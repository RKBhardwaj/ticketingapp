import { useEffect } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/useRequest';

const Signout = () => {
  const { doRequest } = useRequest({
    url: '/api/users/signout',
    method: 'post',
    body: {},
    onSuccess: () => Router.push('/')
  });

  useEffect(() => {
    doRequest();
  }, []);

  return (
    <h1>You are successfully signout !!!</h1>
  )
};

export default Signout;