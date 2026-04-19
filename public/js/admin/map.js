(function () {
    'use strict';
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    // ── Toast notifications ──
    let toastTimer = null;

    function showToast(message, type = 'success') {
        const toast   = document.getElementById('map-toast');
        const icon    = document.getElementById('map-toast-icon');
        const msg     = document.getElementById('map-toast-message');

        const icons = {
            success: '✓',
            error:   '✕',
        };

        toast.className     = `map-toast toast--${type}`;
        icon.textContent    = icons[type] || '✓';
        msg.textContent     = message;
        toast.style.display = 'flex';

        // Trigger fade in
        requestAnimationFrame(() => toast.classList.add('toast--visible'));

        // Clear any existing timer
        if (toastTimer) clearTimeout(toastTimer);

        // Auto dismiss after 3 seconds
        toastTimer = setTimeout(() => {
            toast.classList.remove('toast--visible');
            setTimeout(() => { toast.style.display = 'none'; }, 250);
        }, 3000);
    }
    // ── Map init ──
    const bounds = L.latLngBounds(
        [17.5200, 121.6200],
        [17.7200, 121.8500]
    );

    const map = L.map('map', {
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
        minZoom: 12,
        maxZoom: 19,
        zoomControl: false,
    }).setView([17.6132, 121.7270], 14);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // ── State ──
    let isAddingPin   = false;
    let tempMarker    = null;
    let pendingLatLng = null;
    let allMarkers    = [];

    // ── Category config ──
    const CATEGORY_COLORS = {
        'health':          '#c0392b',
        'education':       '#2980b9',
        'infrastructure':  '#e67e22',
        'livelihood':      '#27ae60',
        'disaster-risk':   '#8e44ad',
        'social-services': '#16a085',
    };

    const CATEGORY_LABELS = {
        'health':          'Health',
        'education':       'Education',
        'infrastructure':  'Infrastructure',
        'livelihood':      'Livelihood',
        'disaster-risk':   'Disaster Risk',
        'social-services': 'Social Services',
    };

    // ── Barangay polygons (point-in-polygon detection) ──
    // Coordinates are [lat, lng] pairs extracted from DB
    const BARANGAY_POLYGONS = [
        { name: 'Annafunan East', polygon: [[17.653179,121.738861],[17.652981,121.737801],[17.652519,121.728958],[17.65238,121.727722],[17.652309,121.72654],[17.652161,121.724258],[17.651991,121.721977],[17.65196,121.720917],[17.648951,121.71978],[17.64764,121.721153],[17.645149,121.721428],[17.642639,121.721916],[17.64209,121.721893],[17.639709,121.72261],[17.637671,121.722893],[17.638321,121.731247],[17.653179,121.738861]] },
        { name: 'Annafunan West', polygon: [[17.65196,121.720917],[17.651939,121.719673],[17.65193,121.71962],[17.648689,121.702316],[17.648149,121.700417],[17.64019,121.711678],[17.63636,121.715431],[17.637671,121.722893],[17.639709,121.72261],[17.64209,121.721893],[17.642639,121.721916],[17.645149,121.721428],[17.64764,121.721153],[17.648951,121.71978],[17.65196,121.720917]] },
        { name: 'Atulayan Norte', polygon: [[17.638321,121.731247],[17.637671,121.722893],[17.63636,121.715431],[17.632959,121.718697],[17.6339,121.728928],[17.638321,121.731247]] },
        { name: 'Atulayan Sur', polygon: [[17.6339,121.728928],[17.632959,121.718697],[17.63006,121.721603],[17.630079,121.726097],[17.629511,121.726578],[17.63147,121.72776],[17.631451,121.727951],[17.63179,121.728119],[17.631969,121.728104],[17.63213,121.727997],[17.632179,121.727951],[17.6339,121.728928]] },
        { name: 'Bagay', polygon: [[17.648149,121.700417],[17.64818,121.698723],[17.646879,121.698532],[17.645639,121.69854],[17.64357,121.698357],[17.641701,121.698303],[17.640051,121.697929],[17.637211,121.697273],[17.63653,121.698883],[17.632,121.710663],[17.63636,121.715431],[17.64019,121.711678],[17.648149,121.700417]] },
        { name: 'Buntun', polygon: [[17.625959,121.69355],[17.623671,121.692558],[17.621389,121.691498],[17.616541,121.690231],[17.614149,121.688797],[17.61202,121.687431],[17.611589,121.690941],[17.612,121.695953],[17.60989,121.711311],[17.60998,121.713089],[17.61359,121.711967],[17.61643,121.712593],[17.61684,121.712608],[17.617781,121.712921],[17.618601,121.71328],[17.619381,121.713913],[17.620131,121.714767],[17.62079,121.715607],[17.62129,121.716141],[17.6243,121.711739],[17.625879,121.699883],[17.625311,121.696327],[17.625959,121.69355]] },
        { name: 'Caggay', polygon: [[17.65411,121.74939],[17.632919,121.736656],[17.62937,121.741226],[17.62924,121.741943],[17.630699,121.74231],[17.632259,121.742996],[17.633631,121.743858],[17.63448,121.744926],[17.63492,121.746048],[17.63542,121.747437],[17.635691,121.748657],[17.636,121.749947],[17.6364,121.750961],[17.63698,121.752403],[17.637289,121.753357],[17.63752,121.754272],[17.63765,121.75518],[17.637871,121.755989],[17.638281,121.756683],[17.638901,121.757477],[17.639391,121.758118],[17.640011,121.758598],[17.640591,121.759193],[17.64115,121.76001],[17.64205,121.760803],[17.65411,121.74939]] },
        { name: 'Capatan', polygon: [[17.62451,121.74176],[17.62332,121.742027],[17.621719,121.741928],[17.62093,121.741867],[17.619909,121.741447],[17.61867,121.740707],[17.61698,121.739632],[17.61591,121.738564],[17.615021,121.737503],[17.61368,121.73616],[17.6131,121.734894],[17.61235,121.733917],[17.61195,121.733437],[17.61116,121.733498],[17.610359,121.734039],[17.60984,121.735161],[17.609221,121.735901],[17.60841,121.737396],[17.608919,121.738762],[17.609301,121.740288],[17.60956,121.741814],[17.60894,121.743027],[17.60989,121.742767],[17.61735,121.754791],[17.62447,121.746178],[17.626089,121.743187],[17.626141,121.74202],[17.625299,121.741867],[17.62451,121.74176]] },
        { name: 'Carig Norte', polygon: [[17.688931,121.74324],[17.688089,121.744049],[17.68688,121.745461],[17.6863,121.746246],[17.68458,121.746483],[17.68335,121.746628],[17.68243,121.747002],[17.68083,121.746933],[17.679649,121.74649],[17.679411,121.748192],[17.673849,121.776001],[17.67831,121.777946],[17.682911,121.779877],[17.68758,121.782257],[17.689659,121.744888],[17.688931,121.74324]] },
        { name: 'Carig Sur', polygon: [[17.677719,121.740379],[17.674179,121.740013],[17.66637,121.740227],[17.65765,121.740547],[17.65715,121.739967],[17.65633,121.739853],[17.65678,121.741737],[17.65522,121.74472],[17.657591,121.746193],[17.65411,121.74939],[17.64205,121.760803],[17.66781,121.773361],[17.673849,121.776001],[17.679411,121.748192],[17.679649,121.74649],[17.679029,121.745193],[17.67861,121.743309],[17.677719,121.740379]] },
        { name: 'Caritan Centro', polygon: [[17.624041,121.725166],[17.627729,121.721764],[17.62237,121.71785],[17.622419,121.724297],[17.624041,121.725166]] },
        { name: 'Caritan Norte', polygon: [[17.63006,121.721603],[17.62993,121.719513],[17.627729,121.721764],[17.624041,121.725166],[17.62678,121.72789],[17.62859,121.726723],[17.629511,121.726578],[17.630079,121.726097],[17.63006,121.721603]] },
        { name: 'Caritan Sur', polygon: [[17.622419,121.724297],[17.62237,121.71785],[17.62129,121.716141],[17.62079,121.715607],[17.620131,121.714767],[17.619381,121.713913],[17.618601,121.71328],[17.617781,121.712921],[17.61684,121.712608],[17.61643,121.712593],[17.616249,121.716881],[17.616159,121.718826],[17.616119,121.720612],[17.61595,121.724953],[17.615879,121.726028],[17.61615,121.726067],[17.61705,121.72625],[17.61787,121.72641],[17.61865,121.726692],[17.619329,121.726486],[17.6199,121.726334],[17.620319,121.726212],[17.62149,121.725037],[17.622419,121.724297]] },
        { name: 'Cataggaman Nuevo', polygon: [[17.60989,121.711311],[17.602119,121.707687],[17.59503,121.705032],[17.58713,121.703217],[17.585501,121.703232],[17.586679,121.705383],[17.58757,121.707047],[17.588209,121.709488],[17.5891,121.709824],[17.58983,121.710327],[17.591021,121.711517],[17.591631,121.712143],[17.592661,121.713058],[17.593361,121.713623],[17.593321,121.713043],[17.59314,121.712128],[17.59351,121.712349],[17.593941,121.712914],[17.594351,121.713562],[17.59478,121.714111],[17.595989,121.715347],[17.596621,121.716026],[17.596939,121.71666],[17.597269,121.717911],[17.59745,121.719467],[17.597321,121.72065],[17.597111,121.722076],[17.596979,121.723602],[17.59709,121.724632],[17.5972,121.725899],[17.59819,121.727211],[17.599701,121.729187],[17.601721,121.730713],[17.603491,121.732529],[17.6045,121.733887],[17.605459,121.733223],[17.60722,121.729874],[17.607759,121.728859],[17.607889,121.728104],[17.608219,121.726128],[17.60998,121.713089],[17.60989,121.711311]] },
        { name: 'Cataggaman Pardo', polygon: [[17.61025,121.687477],[17.608179,121.687172],[17.605631,121.686172],[17.605949,121.689003],[17.602119,121.707687],[17.60989,121.711311],[17.612,121.695953],[17.611589,121.690941],[17.61202,121.687431],[17.61025,121.687477]] },
        { name: 'Cataggaman Viejo', polygon: [[17.602119,121.707687],[17.605949,121.689003],[17.605631,121.686172],[17.601789,121.685188],[17.599001,121.685318],[17.59594,121.685066],[17.594641,121.685013],[17.59268,121.684479],[17.589041,121.685402],[17.58742,121.686928],[17.58604,121.688759],[17.583799,121.691353],[17.582939,121.694397],[17.581949,121.696838],[17.58246,121.699577],[17.583599,121.701561],[17.585501,121.703232],[17.58713,121.703217],[17.59503,121.705032],[17.602119,121.707687]] },
        { name: 'Centro 01', polygon: [[17.6127,121.72802],[17.61268,121.726837],[17.6124,121.725677],[17.610991,121.725487],[17.611151,121.724243],[17.611059,121.723572],[17.610861,121.72316],[17.61031,121.723137],[17.609909,121.723267],[17.60973,121.723457],[17.609961,121.724167],[17.61014,121.725029],[17.610001,121.72525],[17.6098,121.7257],[17.60906,121.725838],[17.608219,121.726128],[17.607889,121.728104],[17.610941,121.728027],[17.61166,121.727997],[17.6127,121.72802]] },
        { name: 'Centro 02', polygon: [[17.616119,121.727951],[17.616131,121.727058],[17.61615,121.726067],[17.615879,121.726028],[17.615009,121.725853],[17.613951,121.725761],[17.6124,121.725677],[17.61268,121.726837],[17.6127,121.72802],[17.61392,121.727982],[17.615021,121.727943],[17.616119,121.727951]] },
        { name: 'Centro 03', polygon: [[17.617809,121.728912],[17.617821,121.727959],[17.617849,121.727173],[17.61787,121.72641],[17.61705,121.72625],[17.61615,121.726067],[17.616131,121.727058],[17.616119,121.727951],[17.6161,121.728867],[17.617041,121.728943],[17.617809,121.728912]] },
        { name: 'Centro 04', polygon: [[17.619419,121.73098],[17.619419,121.730057],[17.61941,121.729103],[17.6194,121.72789],[17.61936,121.72718],[17.619329,121.726486],[17.61865,121.726692],[17.61787,121.72641],[17.617849,121.727173],[17.617821,121.727959],[17.617809,121.728912],[17.617809,121.73008],[17.61779,121.731003],[17.61779,121.731819],[17.618361,121.731483],[17.619419,121.73098]] },
        { name: 'Centro 05', polygon: [[17.612761,121.729927],[17.612761,121.72908],[17.6127,121.72802],[17.61166,121.727997],[17.610941,121.728027],[17.607889,121.728104],[17.607759,121.728859],[17.60722,121.729874],[17.610929,121.729927],[17.61161,121.729927],[17.612761,121.729927]] },
        { name: 'Centro 06', polygon: [[17.6161,121.728867],[17.616119,121.727951],[17.615021,121.727943],[17.61392,121.727982],[17.6127,121.72802],[17.612761,121.72908],[17.612761,121.729927],[17.613831,121.729912],[17.61503,121.729889],[17.616079,121.729889],[17.6161,121.728867]] },
        { name: 'Centro 07', polygon: [[17.61779,121.731819],[17.61779,121.731003],[17.617809,121.73008],[17.617809,121.728912],[17.617041,121.728943],[17.6161,121.728867],[17.616079,121.729889],[17.61599,121.730751],[17.615721,121.731773],[17.61656,121.731781],[17.61779,121.731819]] },
        { name: 'Centro 08', polygon: [[17.62097,121.729889],[17.620911,121.729599],[17.62079,121.728317],[17.62149,121.725037],[17.620319,121.726212],[17.6199,121.726334],[17.619329,121.726486],[17.61936,121.72718],[17.6194,121.72789],[17.61941,121.729103],[17.619419,121.730057],[17.619419,121.73098],[17.62097,121.729889]] },
        { name: 'Centro 09', polygon: [[17.61195,121.733437],[17.61244,121.73278],[17.61273,121.73172],[17.612749,121.730728],[17.612761,121.729927],[17.61161,121.729927],[17.610929,121.729927],[17.60722,121.729874],[17.605459,121.733223],[17.6045,121.733887],[17.60589,121.734962],[17.607401,121.736183],[17.60841,121.737396],[17.609221,121.735901],[17.60984,121.735161],[17.610359,121.734039],[17.61116,121.733498],[17.61195,121.733437]] },
        { name: 'Centro 10', polygon: [[17.61698,121.739632],[17.617479,121.738678],[17.61779,121.731819],[17.61656,121.731781],[17.615721,121.731773],[17.61599,121.730751],[17.616079,121.729889],[17.61503,121.729889],[17.613831,121.729912],[17.612761,121.729927],[17.612749,121.730728],[17.61273,121.73172],[17.61244,121.73278],[17.61195,121.733437],[17.61235,121.733917],[17.6131,121.734894],[17.61368,121.73616],[17.615021,121.737503],[17.61591,121.738564],[17.61698,121.739632]] },
        { name: 'Centro 11', polygon: [[17.62451,121.74176],[17.624411,121.74054],[17.62212,121.729263],[17.62097,121.729889],[17.619419,121.73098],[17.618361,121.731483],[17.61779,121.731819],[17.617479,121.738678],[17.61698,121.739632],[17.61867,121.740707],[17.619909,121.741447],[17.62093,121.741867],[17.621719,121.741928],[17.62332,121.742027],[17.62451,121.74176]] },
        { name: 'Centro 12', polygon: [[17.624041,121.725166],[17.622419,121.724297],[17.62149,121.725037],[17.62079,121.728317],[17.620911,121.729599],[17.62097,121.729889],[17.62212,121.729263],[17.62315,121.728813],[17.623739,121.728722],[17.62488,121.728722],[17.62591,121.728477],[17.62678,121.72789],[17.624041,121.725166]] },
        { name: 'Dadda', polygon: [[17.56814,121.82251],[17.584749,121.810493],[17.567711,121.780579],[17.56436,121.777702],[17.562799,121.775749],[17.56176,121.773621],[17.56102,121.772659],[17.56028,121.773529],[17.55925,121.774719],[17.55916,121.774834],[17.55798,121.776001],[17.55665,121.777],[17.55525,121.778053],[17.554211,121.778831],[17.55274,121.779556],[17.55142,121.780472],[17.54969,121.781967],[17.54747,121.783333],[17.545151,121.784042],[17.545959,121.785133],[17.56814,121.82251]] },
        { name: 'Gosi Norte', polygon: [[17.61014,121.789352],[17.612711,121.787247],[17.59478,121.758087],[17.59478,121.758049],[17.595079,121.757843],[17.595079,121.7575],[17.594549,121.75769],[17.59428,121.757187],[17.594139,121.756943],[17.59412,121.756752],[17.594641,121.756729],[17.59498,121.756607],[17.595169,121.756439],[17.59515,121.756287],[17.594709,121.756157],[17.594231,121.755989],[17.5938,121.755791],[17.593451,121.755623],[17.58909,121.749893],[17.587799,121.748962],[17.585791,121.750008],[17.57864,121.754082],[17.57975,121.754913],[17.58753,121.766167],[17.59288,121.77552],[17.604561,121.793297],[17.61014,121.789352]] },
        { name: 'Gosi Sur', polygon: [[17.60051,121.795914],[17.604561,121.793297],[17.59288,121.77552],[17.58753,121.766167],[17.57975,121.754913],[17.57864,121.754082],[17.57658,121.755302],[17.57539,121.756058],[17.574051,121.757057],[17.573311,121.757629],[17.572651,121.758148],[17.572029,121.758659],[17.571369,121.759178],[17.571039,121.759453],[17.575109,121.76268],[17.5966,121.79866],[17.60051,121.795914]] },
        { name: 'Larion Alto', polygon: [[17.64115,121.76001],[17.640591,121.759193],[17.640011,121.758598],[17.639391,121.758118],[17.638901,121.757477],[17.638281,121.756683],[17.637871,121.755989],[17.637541,121.756531],[17.622061,121.762741],[17.62792,121.77343],[17.62863,121.772758],[17.6287,121.7724],[17.629089,121.772118],[17.62973,121.771759],[17.631241,121.770943],[17.63249,121.770401],[17.633789,121.769348],[17.635031,121.768494],[17.636721,121.767754],[17.637819,121.767357],[17.63892,121.766563],[17.639879,121.765083],[17.64043,121.763397],[17.640619,121.762482],[17.64115,121.76001]] },
        { name: 'Larion Bajo', polygon: [[17.637871,121.755989],[17.63765,121.75518],[17.63752,121.754272],[17.637289,121.753357],[17.63698,121.752403],[17.6364,121.750961],[17.636,121.749947],[17.635691,121.748657],[17.63542,121.747437],[17.63492,121.746048],[17.63448,121.744926],[17.633631,121.743858],[17.632259,121.742996],[17.630699,121.74231],[17.62924,121.741943],[17.62858,121.74202],[17.627741,121.742126],[17.62676,121.74202],[17.626141,121.74202],[17.626089,121.743187],[17.62447,121.746178],[17.61735,121.754791],[17.622061,121.762741],[17.637541,121.756531],[17.637871,121.755989]] },
        { name: 'Leonarda', polygon: [[17.65411,121.74939],[17.657591,121.746193],[17.65522,121.74472],[17.63357,121.735443],[17.632919,121.736656],[17.65411,121.74939]] },
        { name: 'Libag Norte', polygon: [[17.622061,121.762741],[17.61735,121.754791],[17.60989,121.742767],[17.60894,121.743027],[17.60895,121.743591],[17.60895,121.7444],[17.60877,121.745087],[17.60821,121.746399],[17.60718,121.747482],[17.606159,121.74823],[17.605129,121.748352],[17.60372,121.748177],[17.602449,121.748062],[17.600519,121.748131],[17.603979,121.752441],[17.621031,121.779999],[17.621441,121.779861],[17.621929,121.779457],[17.622471,121.778862],[17.62385,121.777473],[17.624849,121.776604],[17.62636,121.775108],[17.62792,121.77343],[17.622061,121.762741]] },
        { name: 'Libag Sur', polygon: [[17.621031,121.779999],[17.603979,121.752441],[17.600519,121.748131],[17.5984,121.748543],[17.596661,121.748306],[17.594021,121.748154],[17.59177,121.748032],[17.589939,121.748093],[17.587799,121.748962],[17.58909,121.749893],[17.593451,121.755623],[17.5938,121.755791],[17.594231,121.755989],[17.594709,121.756157],[17.59515,121.756287],[17.595169,121.756439],[17.59498,121.756607],[17.594641,121.756729],[17.59412,121.756752],[17.594139,121.756943],[17.59428,121.757187],[17.594549,121.75769],[17.595079,121.7575],[17.595079,121.757843],[17.59478,121.758049],[17.59478,121.758087],[17.612711,121.787247],[17.616871,121.784042],[17.617029,121.783417],[17.618219,121.782097],[17.619341,121.781013],[17.62042,121.780151],[17.621031,121.779999]] },
        { name: 'Linao East', polygon: [[17.660963,121.717575],[17.65193,121.71962],[17.651939,121.719673],[17.65196,121.720917],[17.651991,121.721977],[17.652161,121.724258],[17.652309,121.72654],[17.65238,121.727722],[17.652519,121.728958],[17.652981,121.737801],[17.653179,121.738861],[17.65633,121.739853],[17.65715,121.739967],[17.65765,121.740547],[17.66637,121.740227],[17.660963,121.717575]] },
        { name: 'Linao Norte', polygon: [[17.67597,121.720573],[17.675421,121.718811],[17.67417,121.716492],[17.67313,121.714867],[17.671637,121.715523],[17.660963,121.717575],[17.66637,121.740227],[17.674179,121.740013],[17.677719,121.740379],[17.676769,121.738678],[17.676559,121.736816],[17.67675,121.734787],[17.67695,121.73304],[17.677361,121.730782],[17.67771,121.729027],[17.67734,121.726959],[17.677019,121.724518],[17.676451,121.722443],[17.67597,121.720573]] },
        { name: 'Linao West', polygon: [[17.67313,121.714867],[17.672609,121.713669],[17.672552,121.713608],[17.671511,121.712479],[17.670731,121.711288],[17.670111,121.71048],[17.669279,121.709488],[17.668289,121.708359],[17.66725,121.707108],[17.66637,121.706108],[17.665279,121.704933],[17.664339,121.703743],[17.66268,121.702621],[17.66164,121.701927],[17.65934,121.701286],[17.6576,121.700317],[17.656099,121.699638],[17.65444,121.699081],[17.65263,121.69902],[17.651079,121.69902],[17.649469,121.698776],[17.64818,121.698723],[17.648149,121.700417],[17.648689,121.702316],[17.65193,121.71962],[17.660963,121.717575],[17.671637,121.715523],[17.67313,121.714867]] },
        { name: 'Namabbalan Norte', polygon: [[17.5613,121.827629],[17.56814,121.82251],[17.545959,121.785133],[17.545151,121.784042],[17.544069,121.784027],[17.54253,121.785309],[17.54048,121.786163],[17.539181,121.786827],[17.538561,121.78701],[17.536621,121.787956],[17.558241,121.830032],[17.5613,121.827629]] },
        { name: 'Namabbalan Sur', polygon: [[17.536621,121.787956],[17.536579,121.787979],[17.534691,121.788773],[17.53252,121.789619],[17.53133,121.789864],[17.52994,121.790283],[17.51779,121.793243],[17.518061,121.821053],[17.52033,121.824722],[17.529699,121.841339],[17.558241,121.830032],[17.536621,121.787956]] },
        { name: 'Pallua Norte', polygon: [[17.632,121.710663],[17.63653,121.698883],[17.637211,121.697273],[17.633631,121.696342],[17.630939,121.695534],[17.62886,121.69442],[17.625959,121.69355],[17.625311,121.696327],[17.625879,121.699883],[17.632,121.710663]] },
        { name: 'Pallua Sur', polygon: [[17.627729,121.721764],[17.632,121.710663],[17.625879,121.699883],[17.6243,121.711739],[17.62129,121.716141],[17.62237,121.71785],[17.627729,121.721764]] },
        { name: 'Pengue', polygon: [[17.65522,121.74472],[17.65678,121.741737],[17.65633,121.739853],[17.653179,121.738861],[17.638321,121.731247],[17.6339,121.728928],[17.632179,121.727951],[17.63213,121.727997],[17.631969,121.728104],[17.63179,121.728119],[17.631451,121.727951],[17.63147,121.72776],[17.629511,121.726578],[17.62859,121.726723],[17.62678,121.72789],[17.62591,121.728477],[17.62488,121.728722],[17.623739,121.728722],[17.62315,121.728813],[17.62212,121.729263],[17.63357,121.735443],[17.65522,121.74472]] },
        { name: 'San Gabriel', polygon: [[17.632959,121.718697],[17.63636,121.715431],[17.632,121.710663],[17.627729,121.721764],[17.62993,121.719513],[17.63006,121.721603],[17.632959,121.718697]] },
        { name: 'Tagga', polygon: [[17.5966,121.79866],[17.575109,121.76268],[17.571039,121.759453],[17.57057,121.759827],[17.570379,121.760017],[17.56949,121.761093],[17.568689,121.762352],[17.56776,121.763359],[17.5669,121.764542],[17.566259,121.76548],[17.56546,121.766579],[17.565439,121.767593],[17.564289,121.768463],[17.56356,121.768997],[17.562901,121.769974],[17.56216,121.770943],[17.561741,121.771683],[17.56102,121.772659],[17.56176,121.773621],[17.562799,121.775749],[17.56436,121.777702],[17.567711,121.780579],[17.584749,121.810493],[17.5966,121.79866]] },
        { name: 'Tanza', polygon: [[17.632919,121.736656],[17.63357,121.735443],[17.62212,121.729263],[17.624411,121.74054],[17.62451,121.74176],[17.625299,121.741867],[17.626141,121.74202],[17.62676,121.74202],[17.627741,121.742126],[17.62858,121.74202],[17.62924,121.741943],[17.62937,121.741226],[17.632919,121.736656]] },
        { name: 'Ugac Norte', polygon: [[17.615879,121.726028],[17.61595,121.724953],[17.616119,121.720612],[17.616159,121.718826],[17.616249,121.716881],[17.61643,121.712593],[17.61359,121.711967],[17.613634,121.717239],[17.614323,121.720451],[17.613998,121.720764],[17.613951,121.725761],[17.615009,121.725853],[17.615879,121.726028]] },
        { name: 'Ugac Sur', polygon: [[17.613951,121.725761],[17.613998,121.720764],[17.614323,121.720451],[17.613634,121.717239],[17.61359,121.711967],[17.60998,121.713089],[17.608219,121.726128],[17.60906,121.725838],[17.6098,121.7257],[17.610001,121.72525],[17.61014,121.725029],[17.609961,121.724167],[17.60973,121.723457],[17.609909,121.723267],[17.61031,121.723137],[17.610861,121.72316],[17.611059,121.723572],[17.611151,121.724243],[17.610991,121.725487],[17.6124,121.725677],[17.613951,121.725761]] },
    ];

    // ── Point-in-polygon (Ray Casting Algorithm) ──
    function pointInPolygon(lat, lng, polygon) {
        let inside = false;
        const x = lat, y = lng;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];
            const intersect = ((yi > y) !== (yj > y)) &&
                              (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    function getBarangayFromCoords(lat, lng) {
        for (const b of BARANGAY_POLYGONS) {
            if (pointInPolygon(lat, lng, b.polygon)) {
                return b.name;
            }
        }
        return '';
    }

    // ── Custom SVG marker icon ──
    function makeIcon(category) {
        const color = CATEGORY_COLORS[category] || '#1a3a2a';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 8.5 12 20 12 20S24 20.5 24 12C24 5.37 18.63 0 12 0z" fill="${color}"/>
            <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
        </svg>`;
        return L.divIcon({ html: svg, className: '', iconSize: [24,32], iconAnchor: [12,32], popupAnchor: [0,-34] });
    }

    function makeTempIcon() {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 8.5 12 20 12 20S24 20.5 24 12C24 5.37 18.63 0 12 0z" fill="#b5830a" opacity="0.6"/>
            <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
        </svg>`;
        return L.divIcon({ html: svg, className: '', iconSize: [24,32], iconAnchor: [12,32] });
    }

    // ── Stats ──
    function updateStats() {
        document.getElementById('stat-total').textContent     = allMarkers.length;
        const barangays = new Set(allMarkers.map(m => m.data.barangay).filter(Boolean)).size;
        const programs  = new Set(allMarkers.map(m => m.data.category)).size;
        document.getElementById('stat-barangays').textContent = barangays;
        document.getElementById('stat-programs').textContent  = programs;
    }

    // ── Filters ──
    function applyFilters() {
    const searchRaw = (document.getElementById('filter-barangay-search').value || '').trim().toLowerCase();

    const activePrograms = [...document.querySelectorAll('#filter-program .filter-chip.active')]
        .map(b => b.dataset.filter)
        .filter(f => f !== 'all');

    let matchedBarangay = '';

    allMarkers.forEach(({ marker, data }) => {
        const barangayLower = (data.barangay || '').toLowerCase();
        const matchBarangay = searchRaw === '' || barangayLower.includes(searchRaw);
        const matchProgram  = activePrograms.length === 0 || activePrograms.includes(data.category);

        if (matchBarangay && matchProgram) {
            if (!map.hasLayer(marker)) marker.addTo(map);
            if (searchRaw !== '' && matchBarangay) matchedBarangay = data.barangay;
        } else {
            if (map.hasLayer(marker)) map.removeLayer(marker);
        }
    });

    // Update subtitle text
    const el = document.getElementById('map-active-filter');
    const parts = [];
    if (searchRaw !== '') parts.push(matchedBarangay || searchRaw);
    if (activePrograms.length > 0) parts.push(activePrograms.map(p => CATEGORY_LABELS[p] || p).join(', '));
    el.textContent = parts.length > 0 ? 'Filtered: ' + parts.join(' · ') : 'Showing all locations';

    // Update hint below search box
    const hint = document.getElementById('barangay-search-hint');
    if (searchRaw !== '') {
        const count = allMarkers.filter(({ data }) =>
            (data.barangay || '').toLowerCase().includes(searchRaw)
        ).length;
        hint.textContent = count > 0 ? `${count} pin${count !== 1 ? 's' : ''} found` : 'No pins match this barangay';
    } else {
        hint.textContent = '';
    }
}

    document.querySelectorAll('#filter-program .filter-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.filter === 'all') {
                document.querySelectorAll('#filter-program .filter-chip').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            } else {
                document.querySelector('#filter-program .filter-chip[data-filter="all"]').classList.remove('active');
                btn.classList.toggle('active');
                if (document.querySelectorAll('#filter-program .filter-chip.active').length === 0) {
                    document.querySelector('#filter-program .filter-chip[data-filter="all"]').classList.add('active');
                }
            }
            applyFilters();
        });
    });

    document.getElementById('filter-barangay-search').addEventListener('input', applyFilters);

    // ── Add pin mode ──
    const addBtn       = document.getElementById('btn-add-pin');
    const cancelAddBtn = document.getElementById('btn-cancel-add');
    const notice       = document.getElementById('map-adding-notice');

    function startAddPin() {
        isAddingPin = true;
        addBtn.classList.add('map-tool-btn--active');
        notice.style.display = 'flex';
        map.getContainer().style.cursor = 'crosshair';
    }

    function stopAddPin() {
        isAddingPin = false;
        addBtn.classList.remove('map-tool-btn--active');
        notice.style.display = 'none';
        map.getContainer().style.cursor = '';
        if (tempMarker) { map.removeLayer(tempMarker); tempMarker = null; }
        pendingLatLng = null;
    }

    addBtn.addEventListener('click', () => isAddingPin ? stopAddPin() : startAddPin());
    cancelAddBtn.addEventListener('click', stopAddPin);

    // ── Map click: place temp marker, detect barangay, check DB, open modal ──
    map.on('click', async function (e) {
        if (!isAddingPin) return;
        if (tempMarker) map.removeLayer(tempMarker);

        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        pendingLatLng = e.latlng;
        tempMarker = L.marker([lat, lng], { icon: makeTempIcon() }).addTo(map);
        stopAddPin();

        const detectedBarangay = getBarangayFromCoords(lat, lng);

        if (detectedBarangay) {
            const exists = await barangayExistsInDB(detectedBarangay);
            if (!exists) {
                openNewLocationModal(detectedBarangay, lat, lng);
                return;
            }
            // Known barangay — go straight to pin form
            openModal(null, lat, lng, detectedBarangay);
        } else {
            // Pin landed outside all known polygons — prompt to register a new location
            openNewLocationModal('', lat, lng);
        }
    });

    // ── Check if barangay exists in community DB ──
    async function barangayExistsInDB(name) {
        try {
            const res  = await fetch(`/admin/community/check?name=${encodeURIComponent(name)}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) return true;
            const data = await res.json();
            return data.exists === true;
        } catch {
            return true;
        }
    }

    // ── New Location Modal ──
    function openNewLocationModal(barangayName, lat, lng) {
        document.getElementById('nlm-name').value     = barangayName;
        document.getElementById('nlm-city').value     = 'Tuguegarao City';
        document.getElementById('nlm-province').value = 'Cagayan';
        document.getElementById('nlm-error').hidden   = true;
        document.getElementById('nlm-error').textContent = '';
        const descEl = document.getElementById('nlm-description');
        if (barangayName) {
            descEl.innerHTML = `Would you like to add <strong>${barangayName}</strong> to the Community page before placing your pin? You can also skip and place the pin anyway.`;
        } else {
            descEl.innerHTML = `This pin is outside all mapped barangays. Would you like to register a new location before placing your pin? Enter the barangay name below, or skip to place the pin without registering it.`;
        }

        const overlay = document.getElementById('new-location-modal-overlay');
        overlay.style.display = 'flex';
        requestAnimationFrame(() => overlay.classList.add('is-open'));

        const saveBtn   = document.getElementById('nlm-save');
        const skipBtn   = document.getElementById('nlm-skip');
        const closeBtn  = document.getElementById('nlm-close');
        const cancelBtn = document.getElementById('nlm-cancel');

        const newSave   = saveBtn.cloneNode(true);
        const newSkip   = skipBtn.cloneNode(true);
        const newClose  = closeBtn.cloneNode(true);
        const newCancel = cancelBtn.cloneNode(true);

        saveBtn.replaceWith(newSave);
        skipBtn.replaceWith(newSkip);
        closeBtn.replaceWith(newClose);
        cancelBtn.replaceWith(newCancel);

        newSave.addEventListener('click', () => handleNLMSave(lat, lng));
        newSkip.addEventListener('click', () => { closeNewLocationModal(); openModal(null, lat, lng, barangayName); });
        newClose.addEventListener('click',  closeNewLocationModal);
        newCancel.addEventListener('click', closeNewLocationModal);
    }

    async function handleNLMSave(lat, lng) {
        const name     = document.getElementById('nlm-name').value.trim().replace(/\b\w/g, c => c.toUpperCase());;
        const city     = document.getElementById('nlm-city').value.trim().replace(/\b\w/g, c => c.toUpperCase());
        const province = document.getElementById('nlm-province').value.trim().replace(/\b\w/g, c => c.toUpperCase());
        const errorEl  = document.getElementById('nlm-error');

        if (!name || !city || !province) {
            errorEl.textContent = 'Please fill in all required fields.';
            errorEl.hidden = false;
            return;
        }

        const saveBtn    = document.getElementById('nlm-save');
        saveBtn.disabled = true;
        const btnText    = saveBtn.querySelector('.nlm-btn-text');
        const btnSpinner = saveBtn.querySelector('.nlm-btn-spinner');
        if (btnText)    btnText.textContent = 'Adding...';
        if (btnSpinner) btnSpinner.hidden   = false;

        try {
            const res = await fetch('/admin/community', {
                method: 'POST',
                headers: {
                    'Content-Type':      'application/json',
                    'X-CSRF-TOKEN':      csrfToken,
                    'X-Requested-With':  'XMLHttpRequest',
                },
                body: JSON.stringify({ name, city, province }),
            });

            const data = await res.json();

            if (!res.ok) {
                const msg = data.errors?.name?.[0] || data.message || 'Could not add location.';
                errorEl.textContent = msg;
                errorEl.hidden = false;
                return;
            }

            closeNewLocationModal();
            showToast(`"${name}" added to community.`);
            openModal(null, lat, lng, name);

        } catch {
            errorEl.textContent = 'Something went wrong. Please try again.';
            errorEl.hidden = false;
        } finally {
            saveBtn.disabled = false;
            if (btnText)    btnText.textContent = 'Add & Continue';
            if (btnSpinner) btnSpinner.hidden   = true;
        }
    }

    function closeNewLocationModal() {
        const overlay = document.getElementById('new-location-modal-overlay');
        overlay.classList.remove('is-open');
        setTimeout(() => { overlay.style.display = 'none'; }, 220);
    }

    document.getElementById('new-location-modal-overlay').addEventListener('click', function (e) {
        if (e.target === this) closeNewLocationModal();
    });

    // ── Reset view ──
    document.getElementById('btn-reset-view').addEventListener('click', () => {
        map.setView([17.6132, 121.7270], 14);
    });

    // ── Modal (now in sidebar) ──
    function openModal(data, lat, lng, detectedBarangay) {
        document.getElementById('pin-name').value      = data ? data.label     : '';
        document.getElementById('pin-barangay').value  = data ? data.barangay  : (detectedBarangay || '');
        document.getElementById('pin-program').value   = data ? data.category  : '';
        document.getElementById('pin-status').value    = data ? data.status    : 'active';
        document.getElementById('pin-notes').value     = data ? data.notes     : '';
        document.getElementById('pin-lat').value = lat != null ? lat.toFixed(6) : (data ? parseFloat(data.lat).toFixed(6) : '');
        document.getElementById('pin-lng').value = lng != null ? lng.toFixed(6) : (data ? parseFloat(data.lng).toFixed(6) : '');

        document.getElementById('sidebar-form-title').textContent = data ? 'Edit Pin' : 'Add New Pin';
        document.getElementById('sidebar-form-section').style.display = 'flex';
        document.getElementById('sidebar-stats').style.display         = 'none';
        document.getElementById('map-sidebar').querySelectorAll('.sidebar-section:not(.sidebar-form-section)').forEach(el => el.style.display = 'none');
        document.getElementById('sidebar-empty').style.display        = 'none';
        document.getElementById('pin-detail').style.display           = 'none';
        document.getElementById('sidebar-list-section').style.display = 'none';
    }

    function closeModal() {
        document.getElementById('sidebar-form-section').style.display = 'none';
        document.getElementById('sidebar-stats').style.display = 'flex';
        document.getElementById('map-sidebar').querySelectorAll('.sidebar-section:not(.sidebar-form-section)').forEach(el => el.style.display = 'block');
        
        if (allMarkers.length > 0) {
            document.getElementById('sidebar-list-section').style.display = 'block';
            document.getElementById('sidebar-empty').style.display         = 'none';
        } else {
            document.getElementById('sidebar-empty').style.display         = 'flex';
            document.getElementById('sidebar-list-section').style.display  = 'none';
        }
        if (tempMarker) { map.removeLayer(tempMarker); tempMarker = null; }
        pendingLatLng = null;
    }

    document.getElementById('sidebar-form-close').addEventListener('click', closeModal);
    document.getElementById('sidebar-form-cancel').addEventListener('click', closeModal);

    // ── Save pin ──
    document.getElementById('sidebar-form-save').addEventListener('click', async () => {
        const label       = document.getElementById('pin-name').value.trim();
        const barangay    = document.getElementById('pin-barangay').value.trim();
        const category    = document.getElementById('pin-program').value;
        const status      = document.getElementById('pin-status').value;
        const description = document.getElementById('pin-notes').value.trim();
        const lat         = parseFloat(document.getElementById('pin-lat').value);
        const lng         = parseFloat(document.getElementById('pin-lng').value);

        if (!label || !category) {
            alert('Please fill in at least the Site Name and Category.');
            return;
        }

        const saveBtn = document.getElementById('sidebar-form-save');
        saveBtn.disabled    = true;
        saveBtn.textContent = 'Saving...';

        try {
            const isEditing = saveBtn.dataset.pinId;
            const url    = isEditing ? `/admin/pins/${isEditing}` : '/admin/pins';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type':  'application/json',
                    'X-CSRF-TOKEN':  csrfToken,
                },
                body: JSON.stringify({ site_name: label, barangay, category, status, description, latitude: lat, longitude: lng }),
            });

            if (!res.ok) {
                const err = await res.json();
                showToast(err.message || 'Could not save pin.', 'error');
                return;
            }

            const saved = await res.json();

            if (isEditing) {
                // Update existing marker
                const entry = allMarkers.find(m => m.data.id === parseInt(isEditing));
                if (entry) {
                    map.removeLayer(entry.marker);
                    allMarkers = allMarkers.filter(m => m.data.id !== parseInt(isEditing));
                    rebuildSidebarList();
                }
            }

            placeMarker(saved.latitude, saved.longitude, {
                id:       saved.id,
                label:    saved.site_name,
                category: saved.category,
                barangay: saved.barangay,
                status:   saved.status,
                notes:    saved.description,
                lat:      saved.latitude,
                lng:      saved.longitude,
            });

            hidePinDetail();
            closeModal();
            showToast(isEditing ? 'Pin updated successfully.' : 'Pin added successfully.');

        } catch (err) {
            alert('Something went wrong. Please try again.');
            console.error(err);
        } finally {
            saveBtn.disabled    = false;
            saveBtn.textContent = 'Save Pin';
            delete saveBtn.dataset.pinId;
        }
    });

    // ── Place final marker ──
    function placeMarker(lat, lng, data) {
        const { label, category, barangay, status, notes } = data;

        const marker = L.marker([lat, lng], { icon: makeIcon(category) }).addTo(map);

        const color = CATEGORY_COLORS[category] || '#1a3a2a';
        marker.bindPopup(`
            <div class="map-popup">
                <div class="map-popup-category-bar" style="background:${color}"></div>
                <div class="map-popup-body">
                    <div class="map-popup-title-group">
                        <span class="map-popup-name">${label}</span>
                        <span class="map-popup-coords">${lat.toFixed(5)}, ${lng.toFixed(5)}</span>
                    </div>
                    <span class="map-popup-badge" style="background:${color}18; color:${color}; border-color:${color}35;">
                        <span style="width:6px;height:6px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0;"></span>
                        ${CATEGORY_LABELS[category] || category}
                    </span>
                    <div class="map-popup-meta">
                        ${barangay ? `
                        <div class="map-popup-row">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            ${barangay}
                        </div>` : ''}
                        <div class="map-popup-row">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span class="map-popup-status map-popup-status--${status}">${status.replace(/-/g, ' ')}</span>
                        </div>
                    </div>
                    ${notes ? `<p class="map-popup-notes">${notes}</p>` : ''}
                </div>
            </div>
        `, { maxWidth: 260, minWidth: 220 });

        const entry = { marker, data: { ...data, lat, lng } };
        allMarkers.push(entry);
        marker.on('click', () => showPinDetail(entry));
        addToSidebar(entry);
        updateStats();
        applyFilters();
    }

    // ── Sidebar pin detail ──
    function showPinDetail(entry) {
        const { data } = entry;
        const color = CATEGORY_COLORS[data.category] || '#1a3a2a';

        document.getElementById('sidebar-empty').style.display = 'none';
        document.getElementById('pin-detail').style.display = 'block';

        document.getElementById('pin-detail-body').innerHTML = `
            <p class="detail-name">${data.label}</p>
            ${data.barangay ? `
            <div class="detail-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ${data.barangay}
            </div>` : ''}
            <span class="detail-badge">
                <span class="chip-dot" style="background:${color}"></span>
                ${CATEGORY_LABELS[data.category] || data.category}
            </span>
            <div class="detail-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Status: ${data.status}
            </div>
            ${data.notes ? `<p class="detail-notes">${data.notes}</p>` : ''}
            <div class="detail-row" style="font-size:0.68rem; color:#bbb;">${data.lat.toFixed(5)}, ${data.lng.toFixed(5)}</div>
            <div class="detail-actions">
                <button class="detail-btn" id="detail-edit-btn">Edit</button>
                <button class="detail-btn detail-btn--danger" id="detail-delete-btn">Delete</button>
            </div>
        `;

        document.getElementById('detail-edit-btn').addEventListener('click', () => {
            openModal(data, null, null, null);
            document.getElementById('sidebar-form-save').dataset.pinId = data.id;
        });

        document.getElementById('detail-delete-btn').addEventListener('click', () => {
        openDeleteModal(data.label, async () => {
            try {
                const res = await fetch(`/admin/pins/${data.id}`, {
                    method:  'DELETE',
                    headers: { 'X-CSRF-TOKEN': csrfToken },
                });

                if (!res.ok) {
                    showToast('Could not delete pin.', 'error');
                    return;
                }

                map.removeLayer(entry.marker);
                allMarkers = allMarkers.filter(m => m !== entry);
                hidePinDetail();
                updateStats();
                rebuildSidebarList();
                showToast('Pin deleted successfully.');

            } catch (err) {
                showToast('Something went wrong.', 'error');
                console.error(err);
            }
        });
    });
    }

    // Delete confirmation modal
    function openDeleteModal(pinName, onConfirm) {
        document.getElementById('delete-modal-pin-name').textContent = pinName;
        document.getElementById('delete-modal-overlay').style.display = 'flex';

        const confirmBtn = document.getElementById('delete-modal-confirm');
        const cancelBtn  = document.getElementById('delete-modal-cancel');

        const newConfirm = confirmBtn.cloneNode(true);
        const newCancel  = cancelBtn.cloneNode(true);
        confirmBtn.replaceWith(newConfirm);
        cancelBtn.replaceWith(newCancel);

        newConfirm.addEventListener('click', async () => {
            newConfirm.disabled    = true;
            newConfirm.textContent = 'Deleting...';
            await onConfirm();
            closeDeleteModal();
        });

        newCancel.addEventListener('click', closeDeleteModal);
    }

    function closeDeleteModal() {
        document.getElementById('delete-modal-overlay').style.display = 'none';
        const confirmBtn = document.getElementById('delete-modal-confirm');
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            </svg>
            Delete Pin
        `;
    }

    document.getElementById('delete-modal-overlay').addEventListener('click', function (e) {
        if (e.target === this) closeDeleteModal();
    });

    function hidePinDetail() {
        document.getElementById('pin-detail').style.display = 'none';
        if (allMarkers.length > 0) {
            document.getElementById('sidebar-list-section').style.display = 'block';
            document.getElementById('sidebar-empty').style.display         = 'none';
        } else {
            document.getElementById('sidebar-empty').style.display         = 'flex';
            document.getElementById('sidebar-list-section').style.display  = 'none';
        }
    }

    document.getElementById('pin-detail-close').addEventListener('click', hidePinDetail);

    // ── Sidebar list ──
    function addToSidebar(entry) {
        const { data, marker } = entry;
        const color = CATEGORY_COLORS[data.category] || '#1a3a2a';
        const list  = document.getElementById('sidebar-list');

        const item = document.createElement('div');
        item.className  = 'sidebar-list-item';
        item.dataset.id = data.lat + ',' + data.lng;
        item.innerHTML  = `
            <div class="sli-left"><span class="sli-dot" style="background:${color}"></span></div>
            <div class="sli-body">
                <p class="sli-name">${data.label}</p>
                <p class="sli-meta">${data.barangay || '—'} · ${CATEGORY_LABELS[data.category] || data.category}</p>
            </div>
            <button class="sli-fly" title="Fly to">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </button>
        `;

        item.querySelector('.sli-fly').addEventListener('click', (e) => {
            e.stopPropagation();
            map.flyTo([data.lat, data.lng], 16, { duration: 0.8 });
            setTimeout(() => marker.openPopup(), 900);
        });

        item.addEventListener('click', () => showPinDetail(entry));
        list.appendChild(item);

        document.getElementById('sidebar-empty').style.display = 'none';
        document.getElementById('sidebar-list-section').style.display = 'block';
    }

    function rebuildSidebarList() {
        document.getElementById('sidebar-list').innerHTML = '';
        allMarkers.forEach(entry => addToSidebar(entry));
        if (allMarkers.length === 0) {
            document.getElementById('sidebar-list-section').style.display = 'none';
            document.getElementById('sidebar-empty').style.display = 'flex';
        }
        updateStats();
    }

    // Load all saved pins from DB
    async function loadPins() {
        try {
            const res  = await fetch('/admin/pins');
            const pins = await res.json();
            pins.forEach(pin => {
                placeMarker(pin.latitude, pin.longitude, {
                    id:       pin.id,
                    label:    pin.site_name,
                    category: pin.category,
                    barangay: pin.barangay,
                    status:   pin.status,
                    notes:    pin.description,
                    lat:      pin.latitude,
                    lng:      pin.longitude,
                });
            });
        } catch (err) {
            console.error('Failed to load pins:', err);
        }
    }

    loadPins();
})();