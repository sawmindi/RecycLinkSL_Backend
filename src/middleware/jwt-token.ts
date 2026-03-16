import * as jwt from 'jsonwebtoken';

export class JwtToken {
    public static getVerifiedDecodedToken(token: string) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET, function (err: any, decoded: any) {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        });
    }

    // public static createToken(payload: any, expiresIn = '90d') {
    //     return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn});
    // }

    // public static createPasswordToken(email: string) {
    //     const payload = {email: email};
    //     return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '90d'});
    // }
}
