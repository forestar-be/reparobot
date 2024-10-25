import { User } from '../components/settings/EditUser';

const API_URL = process.env.REACT_APP_API_URL;

export const getAllMachineRepairs = async (token: string) => {
  const response = await fetch(`${API_URL}/supervisor/machine-repairs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ filter: {} }),
  });
  const data = await response.json();
  return data.data;
};

export const fetchRepairById = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/supervisor/machine-repairs/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`${response.statusText} ${response.status}`);
  }

  return await response.json();
};

export const fetchReplacedParts = async (token: string) => {
  const response = await fetch(`${API_URL}/supervisor/replaced-parts`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`${response.statusText} ${response.status}`);
  }

  return await response.json();
};

export const putReplacedParts = async (token: string, data: string[]) => {
  const response = await fetch(`${API_URL}/supervisor/replaced-parts`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`${response.statusText} ${response.status}`);
  }

  return await response.json();
};

export const fetchRepairers = async (token: string) => {
  const response = await fetch(`${API_URL}/supervisor/repairer_names`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`${response.statusText} ${response.status}`);
  }

  return await response.json();
};

export const updateRepair = async (token: string, id: string, data: any) => {
  const response = await fetch(`${API_URL}/supervisor/machine-repairs/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return await response.json();
};

export const fetchUsers = async (token: string) => {
  const response = await fetch(`${API_URL}/supervisor/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`${response.statusText} ${response.status}`);
  }

  return await response.json();
};

export const addUser = async (token: string, user: any) => {
  const response = await fetch(`${API_URL}/supervisor/users`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error(`${response.statusText} ${response.status}`);
  }

  return await response.json();
};

export const updateUser = async (token: string, id: string, user: any) => {
  const response = await fetch(`${API_URL}/supervisor/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error(`${response.statusText} ${response.status}`);
  }

  return await response.json();
};

export const deleteUser = async (token: string, id: string) => {
  const response = await fetch(`${API_URL}/supervisor/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`${response.statusText} ${response.status}`);
  }

  return await response.json();
};
