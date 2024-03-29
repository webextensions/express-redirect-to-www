var redirectToWww = function ({
    redirectStatusCode,
    shouldSkip,
    beforeRedirect,
    onError
} = {}) {
    if (typeof redirectStatusCode === 'number' && redirectStatusCode >= 300 && redirectStatusCode <= 399) {
        // do nothing
    } else {
        redirectStatusCode = 307; // Temporary redirect
    }
    return function (req, res, next) {
        try {
            if (typeof shouldSkip === 'function' && shouldSkip({ req, res })) {
                return next();
            }

            if (
                typeof req.get('host') === 'string' &&
                typeof req.hostname === 'string'
            ) {
                var host = req.get('host'),                 // req.get('host') contains port number as well
                    hostname = req.hostname;                // req.hostname doesn't contain port number
                var wwwFound = hostname.match(/^www\./i),
                    dotFound = hostname.match(/\./),
                    isLikelyAnIpAddress = hostname.match(/^[\d]+\.[\d]+\.[\d]+\.[\d]+$/);   // A simple check (also satisfies number beyond IP address range, but it should be fine for normal use-cases)
                if (!wwwFound && dotFound && !isLikelyAnIpAddress) {
                    var redirectToUrl = req.protocol + '://' + 'www.' + host + req.originalUrl;

                    if (typeof beforeRedirect === 'function') {
                        beforeRedirect({ req, res, redirectStatusCode, redirectToUrl });
                    }

                    return res.redirect(redirectStatusCode, redirectToUrl);
                }
                return next();
            } else { // To reach this "else" condition, try something like: curl -H "host:" 127.0.0.1
                return res.status(400).send('400 Bad Request - Please access the "www." version of this website.\n');
            }
        } catch (error) {
            console.error(error);
            console.error(
                `Error: Error caught in express-redirect-to-www.` +
                ` req.headers = ${JSON.stringify(req.headers)} ;` +
                ` req.get('host') = ${req.get('host')} ;` +
                ` req.host = ${req.host} ;` +
                ` req.hostname = ${req.hostname} ;` +
                ` req.method = ${req.method} ;` +
                ` req.originalUrl = ${req.originalUrl} ;` +
                ` req.path = ${req.path} ;` +
                ` req.protocol = ${req.protocol} ;` +
                ` req.subdomains = ${req.subdomains} ;` +
                ` req.url = ${req.url} ;` +
                ` req._parsedUrl = ${JSON.stringify(req._parsedUrl)} ;`
            );

            if (typeof onError === 'function') {
                onError({ req, res, next, error });
            } else {
                throw error;
            }
        }
    };
};
module.exports = redirectToWww;
