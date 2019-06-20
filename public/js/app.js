(function() {
  const submitBtn = document.getElementById('form-submit')
  submitBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const formData = getFormData();
    const res = submitForm(formData).then(function(data) {
      console.log(data);
    })
    
  });

  const getFormData = function() {
    const form = document.getElementById('form');
    return {
      userEmail: form.userEmail.value,
      customerId: form.customerId.value,
      customerFirstName: form.customerFirstName.value,
      customerLastName: form.customerLastName.value,
      customerEmail: form.customerEmail.value,
      customerTitle: form.customerTitle.value,
    }
  }

  const submitForm = function(formData) {
    return fetch('/pricefiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    }).then(function(response) {
      if ( response.status === 200) {
        return response.json();
      } else {
        throw new Error('Unable to submit form');
      }
    }).then(function(data) {
      console.log(data);
      return data
    })
  }
})();
