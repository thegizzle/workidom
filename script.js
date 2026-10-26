// ============================================================================
// CONFIGURATION FORMSPREE
// Créez un formulaire gratuit sur https://formspree.io/ et collez votre URL
// ou votre identifiant ci-dessous (ex: "https://formspree.io/f/xabcdefg").
// Vous pouvez aussi modifier directement l'attribut `action` dans index.html.
// ============================================================================
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mkjjjbqd';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('waitlist-form');
    const nameInput = document.getElementById('user-name');
    const emailInput = document.getElementById('user-email');
    const submitBtn = document.getElementById('submit-btn');
    const submitBtnText = document.getElementById('submit-btn-text');
    const serverErrorMsg = document.getElementById('form-server-error');
    const confirmationBox = document.getElementById('confirmation-message');
    const confirmationDetails = document.getElementById('confirmation-details');
    const logoHomeLink = document.getElementById('logo-home-link');
    const yearSpan = document.getElementById('current-year');

    // Mise à jour automatique de l'année
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Validation simple d'adresse e-mail
    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    };

    const setFieldError = (inputElement, hasError) => {
        const group = inputElement.closest('.input-group');
        if (!group) return;
        if (hasError) {
            group.classList.add('has-error');
            inputElement.setAttribute('aria-invalid', 'true');
        } else {
            group.classList.remove('has-error');
            inputElement.removeAttribute('aria-invalid');
        }
    };

    const showServerError = (message) => {
        if (!serverErrorMsg) return;
        if (message) {
            serverErrorMsg.textContent = message;
            serverErrorMsg.hidden = false;
        } else {
            serverErrorMsg.textContent = '';
            serverErrorMsg.hidden = true;
        }
    };

    // Effacer l'erreur lors de la saisie
    [nameInput, emailInput].forEach((input) => {
        input.addEventListener('input', () => {
            setFieldError(input, false);
            showServerError('');
        });
    });

    // Soumission du formulaire vers Formspree
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        showServerError('');

        const nameValue = nameInput.value.trim();
        const emailValue = emailInput.value.trim();

        let isValid = true;

        if (!nameValue) {
            setFieldError(nameInput, true);
            isValid = false;
        } else {
            setFieldError(nameInput, false);
        }

        if (!emailValue || !isValidEmail(emailValue)) {
            setFieldError(emailInput, true);
            isValid = false;
        } else {
            setFieldError(emailInput, false);
        }

        if (!isValid) {
            return;
        }

        // Déterminer l'URL Formspree à utiliser (priorité à l'attribut action du HTML s'il a été personnalisé)
        const htmlAction = form.getAttribute('action') || '';
        const endpoint = !htmlAction.includes('VOTRE_ID_FORMSPREE') ? htmlAction : FORMSPREE_ENDPOINT;

        if (endpoint.includes('VOTRE_ID_FORMSPREE')) {
            showServerError(
                'Veuillez configurer votre identifiant Formspree (remplacez VOTRE_ID_FORMSPREE dans index.html ou script.js).'
            );
            return;
        }

        // État de chargement pendant l'envoi
        const originalBtnLabel = submitBtnText ? submitBtnText.textContent : '';
        submitBtn.disabled = true;
        if (submitBtnText) {
            submitBtnText.textContent = 'Envoi en cours...';
        }

        try {
            const formData = new FormData(form);
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorText = errorData && errorData.errors
                    ? errorData.errors.map((err) => err.message).join(', ')
                    : 'Une erreur est survenue lors de l\'envoi. Veuillez réessayer.';
                throw new Error(errorText);
            }

            // Personnalisation du message de confirmation
            confirmationDetails.innerHTML = '';
            const textBefore = document.createTextNode(
                `Merci ${nameValue} ! Votre demande a bien été prise en compte. Nous vous enverrons un e-mail à l'adresse `
            );
            const strongEmail = document.createElement('strong');
            strongEmail.textContent = emailValue;
            const textAfter = document.createTextNode(' dès la sortie de Workidom.');

            confirmationDetails.appendChild(textBefore);
            confirmationDetails.appendChild(strongEmail);
            confirmationDetails.appendChild(textAfter);

            // Afficher le message de confirmation et masquer le formulaire
            form.hidden = true;
            confirmationBox.hidden = false;
        } catch (error) {
            showServerError(
                error.message || 'Impossible d\'envoyer vos informations pour le moment. Vérifiez votre connexion et réessayez.'
            );
        } finally {
            submitBtn.disabled = false;
            if (submitBtnText) {
                submitBtnText.textContent = originalBtnLabel;
            }
        }
    });

    // Clic sur le logo : revenir à la vue principale (formulaire initial)
    if (logoHomeLink) {
        logoHomeLink.addEventListener('click', (event) => {
            event.preventDefault();
            form.reset();
            showServerError('');
            setFieldError(nameInput, false);
            setFieldError(emailInput, false);
            confirmationBox.hidden = true;
            form.hidden = false;
        });
    }
});
