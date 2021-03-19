import { useState } from 'react';
import Router from 'next/router';
import useReqest from '../../hooks/useRequest';

const createTicket = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const { doRequest, errors } = useReqest({
    url: '/api/tickets',
    method: 'post',
    body: {
      title,
      price
    },
    onSuccess: () => Router.push('/')
  });

  const formatPrice = () => {
    const value = parseFloat(price);
    if (isNaN(value)) {
      return;
    }

    setPrice(value.toFixed(2));
  };

  const onSubmit = (event) => {
    event.preventDefault();

    doRequest();
  };

  return (
    <div>
      <h1>Create Ticket</h1>
      {errors}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            className="form-control"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            className="form-control"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={formatPrice}
          />
        </div>
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>

  )
}

export default createTicket;