var redirectToWww = function (redirectStatusCode) {
    if (typeof redirectStatusCode === 'number' && redirectStatusCode >= 300 && redirectStatusCode <= 399) {
        // do nothing
    } else {
        redirectStatusCode = 307; // Temporary redirect
    }
    return function (req, res, next) {
        try {
            var host = req.get('host'),                 // req.get('host') contains port number as well
                hostname = req.hostname;                // req.hostname doesn't contain port number
            var wwwFound = hostname.match(/^www\./i),
                dotFound = hostname.match(/\./),
                isLikelyAnIpAddress = hostname.match(/^[\d]+\.[\d]+\.[\d]+\.[\d]+$/);   // A simple check (also satisfies number beyond IP address range, but it should be fine for normal use-cases)
            if (!wwwFound && dotFound && !isLikelyAnIpAddress) {
                var redirectToUrl = req.protocol + '://' + 'www.' + host + req.originalUrl;
                return res.redirect(redirectStatusCode, redirectToUrl);
            }
            next();
        } catch (e) {
            console.error(e);
            console.error(
                `Error: Error caught in express-redirect-to-https.` +
                ` req.headers = ${req.headers} ;` +
                ` req.host = ${req.host} ;` +
                ` req.hostname = ${req.hostname} ;` +
                ` req.method = ${req.method} ;` +
                ` req.originalUrl = ${req.originalUrl} ;` +
                ` req.path = ${req.path} ;` +
                ` req.protocol = ${req.protocol} ;` +
                ` req.subdomains = ${req.subdomains} ;` +
                ` req.url = ${req.url} ;` +
                ` req._parsedUrl = ${req._parsedUrl} ;`
            );

            throw e;
        }
    };
};
module.exports = redirectToWww;
