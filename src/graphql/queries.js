import { gql } from '@apollo/client';

// Product Queries
export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      description
      price
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      description
      price
    }
  }
`;

// Order Queries
export const GET_MY_ORDERS = gql`
  query GetMyOrders {
    myOrders {
      id
      total
      status
      createdAt
      items {
        id
        quantity
        price
        product {
          id
          name
        }
      }
    }
  }
`;

export const GET_ALL_ORDERS = gql`
  query GetAllOrders {
    allOrders {
      id
      total
      status
      createdAt
      user {
        id
        username
      }
      items {
        id
        quantity
        price
        product {
          id
          name
        }
      }
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      total
      status
      createdAt
      user {
        id
        username
      }
      items {
        id
        quantity
        price
        product {
          id
          name
        }
      }
    }
  }
`;

