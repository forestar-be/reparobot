import { User } from '../components/settings/EditUser';
import { ConfigElement } from '../components/settings/EditConfig';

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

export const fetchReplacedParts = async (
  token: string,
): Promise<{ name: string; price: number }[]> => {
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

export const putReplacedParts = async (
  token: string,
  data: { name: string; price: number }[],
) => {
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

export const addRepairer = async (token: string, repairer: string) => {
  const response = await fetch(`${API_URL}/supervisor/repairer_names`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: repairer }),
  });

  if (!response.ok) {
    throw new Error(`${response.statusText} ${response.status}`);
  }

  return await response.json();
};

export const deleteRepairer = async (token: string, repairer: string) => {
  const response = await fetch(
    `${API_URL}/supervisor/repairer_names/${repairer}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`${response.statusText} ${response.status}`);
  }

  return await response.json();
};

export const fetchBrands = async (token: string) => {
  const response = await fetch(`${API_URL}/supervisor/brands`, {
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

export const addBrand = async (token: string, brand: string) => {
  const response = await fetch(`${API_URL}/supervisor/brands`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: brand }),
  });

  if (!response.ok) {
    throw new Error(`${response.statusText} ${response.status}`);
  }

  return await response.json();
};

export const deleteBrand = async (token: string, brand: string) => {
  const response = await fetch(`${API_URL}/supervisor/brands/${brand}`, {
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

export const deleteRepair = async (token: string, id: string) => {
  const response = await fetch(`${API_URL}/supervisor/machine-repairs/${id}`, {
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

export const sendEmailApi = async (
  token: string,
  id: number | string,
  data: FormData,
) => {
  const response = await fetch(
    `${API_URL}/supervisor/machine-repairs/email/${id}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    },
  );

  if (!response.ok) {
    throw new Error(`${response.statusText} ${response.status}`);
  }

  return await response.json();
};

export const fetchConfig = async (token: string) => {
  const response = await fetch(`${API_URL}/supervisor/config`, {
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

export const addConfig = async (
  token: string,
  config: { key: string; value: string },
) => {
  const response = await fetch(`${API_URL}/supervisor/config`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error(`${response.statusText} ${response.status}`);
  }

  return await response.json();
};

export const deleteConfig = async (token: string, key: string) => {
  const response = await fetch(`${API_URL}/supervisor/config/${key}`, {
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

export const updateConfig = async (
  token: string,
  configToUpdate: ConfigElement,
) => {
  const response = await fetch(
    `${API_URL}/supervisor/config/${configToUpdate.key}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(configToUpdate),
    },
  );

  if (!response.ok) {
    throw new Error(`${response.statusText} ${response.status}`);
  }

  return await response.json();
};

export const fetchAllConfig = async (token: string) => {
  const response = await fetch(`${API_URL}/supervisor/allConfig`, {
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
