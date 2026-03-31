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
}
