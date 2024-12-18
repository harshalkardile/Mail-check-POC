const emailExistence = require('email-existence');
const fs = require('fs');

// Enhanced email validation function
function isBusinessEmail(email) {
    const businessDomains = [
        'gmail.com', 'outlook.com', 'yahoo.com',
        'hotmail.com', 'aol.com'
    ];

    const businessPatterns = [
        /^(info|contact|support|sales|marketing|hr|admin|hello)@/i,
        /^(firstname.lastname|f.lastname|firstname.l)@/i,
        /\.(com|org|net|co|io|ai)$/i
    ];

    const domain = email.split('@')[1].toLowerCase();
    const isPersonalDomain = businessDomains.includes(domain);
    const hasBusinessPattern = businessPatterns.some(pattern => pattern.test(email));

    return !isPersonalDomain && hasBusinessPattern;
}

// Function to check email existence
function checkEmailExistence(email) {
    return new Promise((resolve, reject) => {
        emailExistence.check(email, (err, res) => {
            if (err) {
                // Handle specific ENODATA error for DNS issues
                if (err.code === 'ENODATA') {
                    console.log(`
Email: ${email}
Status: Unresolvable
The email is neither personal nor business mail.
                    `);
                    resolve({
                        email: email,
                        exists: false,
                        isBusiness: false,
                        status: 'Unresolvable'
                    });
                    return;
                }

                reject(err);
                return;
            }

            resolve({
                email: email,
                exists: res,
                isBusiness: isBusinessEmail(email)
            });
        });
    });
}

// Process email list
async function cleanEmailList(emails) {
    try {
        const results = [];
        
        for (const email of emails) {
            try {
                const result = await checkEmailExistence(email);
                results.push(result);

                // Print the result based on the status
                if (result.status === 'Unresolvable') {
                    console.log(`
Email: ${result.email}
Status: Unresolvable
                    `);
                } else {
                    console.log(`
Email: ${result.email}
Exists: ${result.exists}
Business Email: ${result.isBusiness}
                    `);
                }
            } catch (checkError) {
                console.error(`Error checking ${email}:`, checkError);
            }
        }

        // Write results to a file
        fs.writeFileSync('email-verification-results.json', JSON.stringify(results, null, 2));
        
        return results;
    } catch (error) {
        console.error('Error processing email list:', error);
    }
}

// Sample email list
const emailList = [
    'kardileharshal567@gmail.com',
    'sainath@plutonext.in',
    'invalid@nonexistentdomain.com',
    'nitinn_gokhle@yahoo.com',
    'invalid@nonexistentdomain.xyz',
    'anmol@plutonext.in',
    'fbishop@hudco.com',
    'another@example.com',
    'telemax@bellsouth.net',
];

// Run the email list cleaning
cleanEmailList(emailList);
