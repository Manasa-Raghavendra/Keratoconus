const BASE_URL = "http://127.0.0.1:8000";


// ======================================================
// LOGIN
// ======================================================
export async function loginDoctor(

  email: string,
  password: string

) {

  const response = await fetch(

    `${BASE_URL}/login`,

    {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({

        email,
        password,
      }),
    }
  );

  return response.json();
}


// ======================================================
// REGISTER
// ======================================================
export async function registerDoctor(data: any) {

  const response = await fetch(

    `${BASE_URL}/register`,

    {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    }
  );

  return response.json();
}


// ======================================================
// PREDICT
// ======================================================
export async function predictKeratoconus(

  formData: FormData

) {

  const token = localStorage.getItem(
    "access_token"
  );

  const response = await fetch(

    `${BASE_URL}/predict`,

    {

      method: "POST",

      headers: {

        Authorization: `Bearer ${token}`,
      },

      body: formData,
    }
  );

  return response.json();
}


// ======================================================
// GET REPORTS
// ======================================================
export async function getReports() {

  const token = localStorage.getItem(
    "access_token"
  );

  const response = await fetch(

    `${BASE_URL}/reports`,

    {

      headers: {

        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
}