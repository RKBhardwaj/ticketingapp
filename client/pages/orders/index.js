const OrderIndex = ({ orders }) => {
  const ordersList = orders.map((order) => {
    return (
      <tr key={order.id}>
        <td>{order.ticket.title}</td>
        <td>{order.status}</td>
      </tr>
    );
  })
  return (
    <div>
      <h1>Orders Details</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Order for Ticket</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {ordersList}
        </tbody>
      </table>
    </div>
  );
};

OrderIndex.getInitialProps = async (context, client) => {
  const { data } = await client.get('/api/orders');

  return { orders: data };
};

export default OrderIndex;
