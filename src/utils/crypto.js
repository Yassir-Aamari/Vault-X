import CryptoJS from 'crypto-js';

export const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString();
};

// Derive a stable key/IV so CryptoJS does not request native random bytes
const deriveKey = (key) => CryptoJS.SHA256(key);
const deriveIv = (key) => CryptoJS.MD5(key);

export const encryptData = (data, key) => {
    try {
        const jsonString = JSON.stringify(data);
        const derivedKey = deriveKey(key);
        const iv = deriveIv(key);

        const encrypted = CryptoJS.AES.encrypt(jsonString, derivedKey, {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        return encrypted.toString();
    } catch (e) {
        console.error('Encryption failed', e);
        return null;
    }
};

export const decryptData = (ciphertext, key) => {
    try {
        const derivedKey = deriveKey(key);
        const iv = deriveIv(key);

        const bytes = CryptoJS.AES.decrypt(ciphertext, derivedKey, {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedData) {
            return null;
        }
        return JSON.parse(decryptedData);
    } catch (e) {
        // Swallow malformed data errors; caller will handle null
        return null;
    }
};

// Generate ID using timestamp and simple random (no crypto needed)
export const generateIdSync = () => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 11);
    return timestamp + randomPart;
};

// Lightweight master password generator (no native crypto)
export const generateMasterPassword = (length = 24) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}';
    let result = '';
    for (let i = 0; i < length; i++) {
        const rand = Math.floor(Math.random() * charset.length);
        result += charset[rand];
    }
    return result;
};
