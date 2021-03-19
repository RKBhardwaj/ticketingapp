import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/useRequest';

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { doRequest, errors } = useRequest({
    url: '/api/users/signin',
    method: 'post',
    body: {
      email,
      password
    },
    onSuccess: () => Router.push('/')
  })

  const onSubmit = async (event) => {
    event.preventDefault();
    doRequest();
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign In</h1>
      {errors}
      <div className="form-group">
        <label>Email Address</label>
        <input
          className="form-control"
          name="emailAddress"
          onChange={e => setEmail(e.target.value)}
          value={email}
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          className="form-control"
          type="password"
          name="password"
          onChange={e => setPassword(e.target.value)}
          value={password}
        />
      </div>
      <div className="button-group">
        <button className="btn btn-primary">Sign In</button>
      </div>
    </form>
  )
};

export default Signin;