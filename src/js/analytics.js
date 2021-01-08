/**
 * Created by Aleksey Chichenkov <a.chichenkov@initi.ru> on 1/8/21.
 */

import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'
const config = require('./compiled.config.js')

const analytics = Analytics({
    app: 'Wanderer',
    plugins: [
        googleAnalytics({
            trackingId: config.analytics.trackingId
        })
    ]
})

export default analytics;