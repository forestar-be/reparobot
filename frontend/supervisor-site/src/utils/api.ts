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

export const updateRepair = async (id: string, data: any) => {
  const response = await fetch(`${API_URL}/supervisor/machine-repairs/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return await response.json();
};
