window.addEventListener('load', () => {
    const createUser = document.querySelector('.create-user');
    const form = document.querySelector('zen-form');
    const welcome = document.querySelector('.welcome');
    const loadFormButton = welcome.querySelector('zen-button');
    const failBackButton = createUser.querySelector('.fail zen-button');

    loadFormButton.addEventListener('click', () => {
        welcome.classList.add('up');
        createUser.classList.remove('hide');
    });

    failBackButton.addEventListener('click', () => {
        createUser.classList.remove('failure');
    });

    form.fields = [{
            type: 'text',
            name: 'name',
            icon: 'user',
            placeholder: 'Full name'
        },
        {
            type: 'email',
            name: 'email',
            icon: 'mail',
            placeholder: 'Email'
        },
        {
            type: 'password',
            name: 'password',
            icon: 'lock',
            placeholder: 'Password'
        },
        {
            type: 'submit',
            value: 'continue'
        }
    ];

    form.addEventListener('submit', async() => {

        const data = {...form.values};

        const name = data.name.split(' ');
        data.fname = name[0];
        data.lname = name.slice(1).join(' ');
        delete data.name;

        const res = await fetch('/api/v1/setup', {
            method: "POST",
            headers: {"content-type": "application/json"},
            body: JSON.stringify(data)
        }).then(r => r.json());

        if (res.statusCode !== 200) fail();
        else succeed(res.data.token);
    });

    const fail = () => {
        createUser.classList.add('failure');
    };

    const succeed = (token) => {
        localStorage.setItem('token', `Bearer ${token}`);
        createUser.classList.add('successful');
    };
});
