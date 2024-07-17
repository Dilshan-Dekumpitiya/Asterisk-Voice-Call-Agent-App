var ctxSip;  // Declare ctxSip globally

$(document).ready(function () {

    // Show the dashboard container after the page loads
    $('#dashboardContainer').fadeIn('slow').removeClass('hidden');

    // Retrieve extensionNumber from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const extensionNumber = urlParams.get('extension');
    const password = urlParams.get('password');

    var user = {
        Display: extensionNumber,
        User: extensionNumber,
        WSServer: "wss://172.20.10.100:8089/ws",
        Pass: password,
        Realm: "172.20.10.100"
    };

    $('#confirmCallButton').click(function () {
        var phone = $('#callContactNumber').text();
        makeCall(phone);
    });

    initializePhone(user);
    $('#phoneInterface').show();

    $('#keypadContainer').removeClass('hidden');
    $('#contactsContainer').addClass('hidden');
    $('#callLog').addClass('hidden');
    $('#callongoing').addClass('hidden');

    $('#btnDashboard').addClass('active');
    $('#btnfavorite').addClass('active');

    // $('#sip-ongoing').removeClass('hidden');

    $('#btnCall').click(function () {
        var target = $("#numDisplay").val();
        if (target) {
            var session = ctxSip.sipCall(target);
            $('#outgoingCallModal').modal('show');

            $('#btnactivecall').click();
            $('#outgoingCallModal').modal('hide');
            resetCallTimer();
            startCallTimer();

            session.on('terminated', function () {
                resetCallTimer();
                stopCallTimer();
                $('#btnactivecall').removeClass('active').prop('disabled', true).empty(); // Disable and clear the active call button
                $('#btnDashboard').addClass('active'); // Select the dashboard button
                $('#dashboardContainer').removeClass('hidden');
                $('#callongoing').addClass('hidden');
            });
        }
    });

    function activateButton(button) {
        $('.btn-color').removeClass('active');
        $(button).addClass('active');
    }

    function activateSecondButton(button) {
        $('.btn-color-top').removeClass('active');
        $(button).addClass('active');
    }

    $('#btnDashboard').click(function () {

        activateButton(this);
        $('#btnactivecall').addClass('active');
        $('#sip-logitems').addClass('hidden');
        $('#keypadContainer').addClass('hidden');
        $('#inboundCallLog').addClass('hidden');
        $('#outboundCallLog').addClass('hidden');
        $('#missedCallLog').addClass('hidden');
        $('#callongoing').addClass('hidden');
        $('#contactsContainer').addClass('hidden');
        $('#dashboardContainer').removeClass('hidden');

    });

    $('#btnContacts').click(function () {
        activateButton(this);
        $('#callLog').removeClass('hidden');
        $('#sip-logitems').addClass('hidden');
        $('#dashboardContainer').addClass('hidden');
        $('#keypadContainer').addClass('hidden');
        $('#inboundCallLog').addClass('hidden');
        $('#outboundCallLog').addClass('hidden');
        $('#missedCallLog').addClass('hidden');
        $('#callongoing').addClass('hidden');
        $('#contactsContainer').removeClass('hidden'); // Show contacts container
        loadContacts(); // Load contacts when the button is clicked
    });


    $('#btnIncoming').click(function () {
        activateButton(this);
        $('#inboundCallLog').removeClass('hidden');
        $('#keypadContainer').addClass('hidden');
        $('#outboundCallLog').addClass('hidden');
        $('#missedCallLog').addClass('hidden');
        $('#callLog').addClass('hidden');
        $('#contactsContainer').addClass('hidden');
        $('#callongoing').addClass('hidden');
        $('#dashboardContainer').addClass('hidden');
    });

    $('#btnOutbound').click(function () {
        activateButton(this);
        $('#outboundCallLog').removeClass('hidden');
        $('#inboundCallLog').addClass('hidden');
        $('#keypadContainer').addClass('hidden');
        $('#missedCallLog').addClass('hidden');
        $('#callLog').addClass('hidden');
        $('#contactsContainer').addClass('hidden');
        $('#callongoing').addClass('hidden');
        $('#dashboardContainer').addClass('hidden');
    });

    $('#btnMissedCall').click(function () {
        activateButton(this);
        $('#missedCallLog').removeClass('hidden');
        $('#inboundCallLog').addClass('hidden');
        $('#keypadContainer').addClass('hidden');
        $('#outboundCallLog').addClass('hidden');
        $('#callLog').addClass('hidden');
        $('#contactsContainer').addClass('hidden');
        $('#callongoing').addClass('hidden');
        $('#dashboardContainer').addClass('hidden');
    });

    $('#btnfavorite').click(function () {
        activateSecondButton(this);
        $('#btnDashboard').addClass('active');
        $('#inboundCallLog').addClass('hidden');
        $('#outboundCallLog').addClass('hidden');
        $('#missedCallLog').addClass('hidden');
        $('#callLog').addClass('hidden');
        $('#contactsContainer').addClass('hidden');
        $('#callongoing').addClass('hidden');
        $('#callTimer').addClass('hidden');
        $('#dashboardContainer').addClass('hidden');
    });

    $('#btnactivecall').click(function () {
        activateSecondButton(this);
        $('#callongoing').removeClass('hidden');
        $('#callTimer').removeClass('hidden');
        // $('#inCallControls').show();
        // $('#btnDashboard').addClass('hidden');
        $('#inboundCallLog').addClass('hidden');
        $('#outboundCallLog').addClass('hidden');
        $('#missedCallLog').addClass('hidden');
        $('#callLog').addClass('hidden');
        $('#contactsContainer').addClass('hidden');
        $('#dashboardContainer').addClass('hidden');
    });

    $('#btnrecentcall').click(function () {
        activateSecondButton(this);
        $('#btnDashboard').addClass('active');
        $('#inboundCallLog').addClass('hidden');
        $('#outboundCallLog').addClass('hidden');
        $('#missedCallLog').addClass('hidden');
        $('#callLog').removeClass('hidden');
        $('#contactsContainer').addClass('hidden');
        $('#callongoing').addClass('hidden');
        $('#callTimer').addClass('hidden');
        $('#dashboardContainer').addClass('hidden');
    });

    $('#btnmissedcall').click(function () {
        activateSecondButton(this);
        $('#missedCallLog').removeClass('hidden');
        $('#btnDashboard').addClass('active');
        $('#callLog').addClass('hidden');
        $('#callongoing').addClass('hidden');
        $('#callTimer').addClass('hidden');
        $('#dashboardContainer').addClass('hidden');
    });

    function loadContacts() {
        $.ajax({
            url: '../contacts/contacts.json',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                var contactsList = $('#contactsList');
                contactsList.empty(); // Clear previous contacts

                data.contacts.forEach(function (contact) {
                    var contactButton = `<button class="contact-button btn btn-primary" data-name="${contact.name}" data-phone="${contact.phone}">
                    ${contact.name} - ${contact.phone}
                </button>`;
                    contactsList.append(contactButton);
                });

                $('.contact-button').click(function () {
                    var name = $(this).data('name');
                    var phone = $(this).data('phone');
                    $('#callContactName').text(name);
                    $('#callContactNumber').text(phone);
                    $('#callContactModal').modal('show');
                });
            },
            error: function (error) {
                console.error('Error fetching contacts:', error);
                $('#contactsList').html('<p>Failed to load contacts.</p>');
            }
        });
    }

    function makeCall(phone) {
        $('#numDisplay').val(phone);
        var session = ctxSip.sipCall(phone);
        $('#btnactivecall').click();
        $('#sip-outgoing').click();
        $('#callContactModal').modal('hide');
        showOutgoingCallModal(phone); // Show outgoing call modal
        
        // Log the outgoing call
        ctxSip.logOutGoingCall({
            displayName: phone,
            remoteIdentity: { uri: { user: phone } },
            direction: 'outgoing',
            ctxid: ctxSip.getUniqueID(),
            status: 'ringing',
            start: Date.now(),
            flow: 'outgoing'
        });
    }

    function showOutgoingCallModal(phone) {
        $('#outgoingCallInfo').text(`Calling: ${phone}`);
        // $('#outgoingCallModal').modal('show');
        
        $('#btnactivecall').click();
        hideOutgoingCallModel(phone);
        // $('#btnactivecall').click();

    }

    function hideOutgoingCallModel(phone) {
        $('#outgoingCallModal').modal('hidden');
        $('#btnactivecall').click();
        
        resetCallTimer();
       
    }

    // function startCallTimer() {
    //     resetCallTimer();
    //     callStartTime = Date.now();
    //     callTimerInterval = setInterval(updateCallTimer, 1000);
    // }

    // function updateCallTimer() {
    //     var currentTime = Date.now();
    //     var elapsedTime = currentTime - callStartTime;

    //     var totalSeconds = Math.floor(elapsedTime / 1000);
    //     var minutes = Math.floor(totalSeconds / 60);
    //     var seconds = totalSeconds % 60;

    //     var timerDisplay = document.getElementById('callTimer');
    //     timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    // }

    // function stopCallTimer() {
    //     clearInterval(callTimerInterval);
    //     resetCallTimer();
    // }

    // function resetCallTimer() {
    //     var timerDisplay = document.getElementById('callTimer');
    //     timerDisplay.textContent = "0:00";
    // }

    $('#btnCall').click(function () {
        var target = $("#numDisplay").val();
        if (target) {
            var session = ctxSip.sipCall(target); // Get the session object
            $('#outgoingCallModal').modal('show');
    
            // Automatically trigger the click event of the active button
            $('#btnactivecall').click();
            $('#outgoingCallModal').modal('hide');
            resetCallTimer();
            startCallTimer();
    
            // Listen for the call termination
            session.on('terminated', function () {
                stopCallTimer();
                resetCallTimer();
                $('#btnDashboard').click();
            });

            session.on('ended', function () {
                stopCallTimer();
                resetCallTimer();
                $('#btnDashboard').click();
            });
        }
    });

    var loggedCallIDs = new Set();  // Create a set to store logged call IDs

    function initializePhone(user) {
        ctxSip = {  // Use global ctxSip
            config: {
                password: user.Pass,
                displayName: user.Display,
                uri: 'sip:' + user.User + '@' + user.Realm,
                wsServers: [user.WSServer],
                registerExpires: 30,
                traceSip: true,
                log: {
                    level: 0,
                }
            },
            ringtone: document.getElementById('ringtone'),
            ringbacktone: document.getElementById('ringbacktone'),
            dtmfTone: document.getElementById('dtmfTone'),
            audioRemote: document.getElementById('audioRemote'),

            Sessions: [],
            callTimers: {},
            callActiveID: null,
            callVolume: 1,
            Stream: null,

            formatPhone: function (phone) {
                var num;
                if (phone.indexOf('@')) {
                    num = phone.split('@')[0];
                } else {
                    num = phone;
                }
                num = num.toString().replace(/[^0-9]/g, '');
                if (num.length === 10) {
                    return '(' + num.substr(0, 3) + ') ' + num.substr(3, 3) + '-' + num.substr(6, 4);
                } else if (num.length === 11) {
                    return '(' + num.substr(1, 3) + ') ' + num.substr(4, 3) + '-' + num.substr(7, 4);
                } else {
                    return num;
                }
            },

            startRingTone: function () {
                try { ctxSip.ringtone.play(); } catch (e) { }
            },

            stopRingTone: function () {
                try { ctxSip.ringtone.pause(); } catch (e) { }
            },

            startRingbackTone: function () {
                try { ctxSip.ringbacktone.play(); } catch (e) { }
            },

            stopRingbackTone: function () {
                try { ctxSip.ringbacktone.pause(); } catch (e) { }
            },

            getUniqueID: function () {
                return Math.random().toString(36).substr(2, 9);
            },

            newSession: function (newSess) {
                newSess.displayName = newSess.remoteIdentity.displayName || newSess.remoteIdentity.uri.user;
                newSess.ctxid = ctxSip.getUniqueID();
                var status;
                if (newSess.direction === 'incoming') {
                    status = "Incoming: " + newSess.displayName;
                    ctxSip.startRingTone();
                } else {
                    status = "Trying: " + newSess.displayName;
                    ctxSip.startRingbackTone();
                }
                ctxSip.logCall(newSess, 'ringing');
                ctxSip.setCallSessionStatus(status);

                newSess.on('progress', function (e) {
                    if (e.direction === 'outgoing') {
                        ctxSip.setCallSessionStatus('Calling...');
                    }
                });

                newSess.on('connecting', function (e) {
                    if (e.direction === 'outgoing') {
                        ctxSip.setCallSessionStatus('Connecting...');
                    }
                });

                newSess.on('accepted', function (e) {
                    ctxSip.stopRingbackTone();
                    ctxSip.stopRingTone();
                    ctxSip.setCallSessionStatus('Answered');
                    ctxSip.logCall(newSess, 'answered');
                    ctxSip.callActiveID = newSess.ctxid;

                    var remoteStream = newSess.sessionDescriptionHandler.peerConnection.getReceivers().map(r => r.track);
                    if (remoteStream && remoteStream[0]) {
                        ctxSip.audioRemote.srcObject = new MediaStream(remoteStream);
                    }

                    $('#incomingCallModal').modal('hide');
                    $('#outgoingCallModal').modal('hide');
                    hideOutgoingCallModel(phone);

                    // Show call handling interface
                    $('#activeCallDetails').removeClass('hidden');
                    $('#callDetails').html('Call with: ' + (newSess.remoteIdentity.displayName || newSess.remoteIdentity.uri.user));



                    // Start call timer
                    resetCallTimer();
                    startCallTimer();
                });

                newSess.on('hold', function (e) {
                    ctxSip.callActiveID = null;
                    ctxSip.logCall(newSess, 'holding');
                    $('#holdCall').hide();
                    $('#unholdCall').show();
                });

                newSess.on('unhold', function (e) {
                    ctxSip.logCall(newSess, 'resumed');
                    ctxSip.callActiveID = newSess.ctxid;
                    $('#unholdCall').hide();
                    $('#holdCall').show();
                });

                newSess.on('muted', function (e) {
                    ctxSip.Sessions[newSess.ctxid].isMuted = true;
                    ctxSip.setCallSessionStatus("Muted");
                });

                newSess.on('unmuted', function (e) {
                    ctxSip.Sessions[newSess.ctxid].isMuted = false;
                    ctxSip.setCallSessionStatus("Answered");
                });

                newSess.on('cancel', function (e) {
                    ctxSip.stopRingTone();
                    ctxSip.stopRingbackTone();
                    ctxSip.setCallSessionStatus("Canceled");
                    if (this.direction === 'outgoing') {
                        ctxSip.callActiveID = null;
                        newSess = null;
                        ctxSip.logCall(this, 'ended');
                    }
                    $('#btnDashboard').click();
                });

                newSess.on('bye', function (e) {
                    ctxSip.stopRingTone();
                    ctxSip.stopRingbackTone();
                    ctxSip.setCallSessionStatus("ended");
                    ctxSip.logCall(newSess, 'ended');
                    ctxSip.callActiveID = null;
                    newSess = null;
                    stopCallTimer();
                    resetCallTimer();
                    $('#inCallControls').hide();
                    $('#outgoingCallModal').modal('hide');
                    stopStopwatchTimer(item.id);
                    $('.btnHoldResume, .btnTransfer, .btnMute, .btnHangUp').hide();
                    $('#btnDashboard').click();
                });

                newSess.on('terminated', function (e) {
                    ctxSip.stopRingTone();
                    ctxSip.stopRingbackTone();
                    ctxSip.setCallSessionStatus('Terminated');
                    stopCallTimer();
                    resetCallTimer();
                    $('#inCallControls').hide();
                    $('#outgoingCallModal').modal('hide');
                    $('.btnHoldResume, .btnTransfer, .btnMute, .btnHangUp').hide();
                    $('#btnDashboard').click();
                });

                newSess.on('failed', function (e) {
                    ctxSip.stopRingTone();
                    ctxSip.stopRingbackTone();
                    ctxSip.setCallSessionStatus('Terminated');
                    stopCallTimer();
                    resetCallTimer();
                    $('#inCallControls').hide();
                    $('#outgoingCallModal').modal('hide');
                    stopStopwatchTimer(item.id);
                    $('.btnHoldResume, .btnTransfer, .btnMute, .btnHangUp').hide();
                    $('#btnDashboard').click();
                });

                newSess.on('rejected', function (e) {
                    ctxSip.stopRingTone();
                    ctxSip.stopRingbackTone();
                    ctxSip.setCallSessionStatus('Rejected');
                    stopCallTimer();
                    resetCallTimer();
                    ctxSip.callActiveID = null;
                    ctxSip.logCall(this, 'ended');
                    newSess = null;
                    $('#inCallControls').hide();
                    $('#outgoingCallModal').modal('hide');
                    $('.btnHoldResume, .btnTransfer, .btnMute, .btnHangUp').hide();
                    stopStopwatchTimer(item.id);
                
                    $('#btnDashboard').click();
                });

                ctxSip.Sessions[newSess.ctxid] = newSess;
            },

            getUserMediaFailure: function (e) {
                window.console.error('getUserMedia failed:', e);
                ctxSip.setError(true, 'Media Error.', 'You must allow access to your microphone.  Check the address bar.', true);
            },

            getUserMediaSuccess: function (stream) {
                ctxSip.Stream = stream;
            },

            setCallSessionStatus: function (status) {
                $('#txtCallStatus').html(status);
            },

            setStatus: function (status) {
                $("#txtRegStatus").html('<i class="fa fa-signal"></i> ' + status);
            },

            logCall: function (session, status) {
                var log = {
                    clid: session.displayName,
                    uri: session.remoteIdentity.uri.toString(),
                    id: session.ctxid,
                    time: new Date().getTime()
                },
                    calllog = JSON.parse(localStorage.getItem('sipCalls'));
                if (!calllog) { calllog = {}; }
                if (!calllog.hasOwnProperty(session.ctxid)) {
                    calllog[log.id] = {
                        id: log.id,
                        clid: log.clid,
                        uri: log.uri,
                        start: log.time,
                        flow: session.direction
                    };
                }
                if (status === 'ended') {
                    calllog[log.id].stop = log.time;
                }
                if (status === 'ended' && calllog[log.id].status === 'ringing') {
                    calllog[log.id].status = 'missed';
                } else {
                    calllog[log.id].status = status;
                }
                localStorage.setItem('sipCalls', JSON.stringify(calllog));
                ctxSip.logShow();
            },


            logIncomeCall: function (session, status) {
                var log = {
                    clid: session.displayName,
                    uri: session.remoteIdentity.uri.toString(),
                    id: session.ctxid,
                    time: new Date().getTime()
                },
                    calllog = JSON.parse(localStorage.getItem('sipCalls'));
                if (!calllog) { calllog = {}; }
                if (!calllog.hasOwnProperty(session.ctxid)) {
                    calllog[log.id] = {
                        id: log.id,
                        clid: log.clid,
                        uri: log.uri,
                        start: log.time,
                        flow: session.direction
                    };
                }
                if (status === 'ended') {
                    calllog[log.id].stop = log.time;
                }
                if (status === 'ended' && calllog[log.id].status === 'ringing') {
                    calllog[log.id].status = 'missed';
                } else {
                    calllog[log.id].status = status;
                }
                localStorage.setItem('sipCalls', JSON.stringify(calllog));
                ctxSip.logIncomeCallShow();
            },





            // logIncomeCall: function (item) {

            //     var callIconSrc;
            //     var cllMode;

            //     var callActive = (item.status !== 'ended' && item.status !== 'missed'),
            //         callLength = (item.status !== 'ended') ? '<span id="' + item.id + '"></span>' : moment.duration(item.stop - item.start).humanize(),
            //         callClass = '';


            //     switch (item.status) {
            //         case 'ringing':
            //             callClass = 'list-group-item-success';
            //             callIconSrc = '../img/ringing.png';
            //             cllMode = 'ringing';
            //             break;
            //         case 'missed':
            //             callClass = 'list-group-item-danger';
            //             if (item.flow === "incoming") { callIconSrc = '../img/inmissed.png'; cllMode = 'incoming'; }
            //             if (item.flow === "outgoing") { callIconSrc = '../img/outmissed.png'; cllMode = 'outgoing'; }
            //             break;
            //         case 'holding':
            //             callClass = 'list-group-item-warning';
            //             callIconSrc = '../img/holding.png';
            //             cllMode = 'holding';
            //             break;
            //         case 'answered':
            //         case 'resumed':
            //             callClass = 'list-group-item-info';
            //             callIconSrc = '../img/answered.png';
            //             cllMode = 'answered';
            //             break;
            //         case 'ended':
            //             if (item.flow === "incoming") { callIconSrc = '../img/incoming.png'; cllMode = 'incoming'; }
            //             if (item.flow === "outgoing") { callIconSrc = '../img/outgoing.png'; cllMode = 'outgoing'; }
            //             break;
            //     }

            //     var logItem = '<div class="sip-ongoing"><div class="list-group-item call-active-card clearfix ' + callClass + '" data-uri="' + item.uri + '" data-sessionid="' + item.id + '" title="Double Click to Call"><div class="align-items-center">';
            //     logItem += '<div class="row-callactive"><div class="d-flex">';
            //     logItem += '<div class="pull-right text-right-callactive"><strong>Unknown</strong><br><img src="../img/income.png" class="icon" alt="call icon" style="width: 150px; height: 150px;"><br><strong class="name-text">' + item.clid + '</strong><br><strong class="status-text">' + cllMode + '</strong></div>';
            //     logItem += '</div><br>';

            //     if (callActive) {
            //         logItem += '<div class="btn-group btn-group-xs pull-right">';
            //         if (item.status === 'ringing' && item.flow === 'incoming') {
            //             logItem += '<button class="btn btn-xs btn-success btnCall" title="Call"><i class="fa fa-phone"></i></button>';
            //         } else {
            //             logItem += '<button class="btn btn-xs btn-primary btnHoldResume" title="Hold" style="margin-left: 10px; width: 60px; height: 60px; border-radius: 30px;"><i class="fa fa-pause"></i></button>';
            //             logItem += '<button class="btn btn-xs btn-info btnTransfer" title="Transfer" style="margin-left: 10px; width: 60px; height: 60px; border-radius: 30px;"><i class="fa fa-random"></i></button>';
            //             logItem += '<button class="btn btn-xs btn-warning btnMute" title="Mute" style="margin-left: 10px; width: 60px; height: 60px; border-radius: 30px;"><i class="fa fa-fw fa-microphone"></i></button>';
            //         }
            //         logItem += '<button class="btn btn-xs btn-danger btnHangUp" title="Hangup" style="margin-left: 10px; width: 60px; height: 60px; border-radius: 30px;"><i class="fa fa-stop"></i></button>';
            //         logItem += '</div>';
            //     }
            //     logItem += '<div class="callTimer" data-sessionid="' + item.id + '" style="font-size: 20px; margin-bottom: 10px;">0:00</div>'; // Add the call timer element
            //     logItem += '</div></div></div></div></div>';

            //     // If the call is answered or resumed, show only the active log
            //     if (item.status === 'answered' || item.status === 'resumed') {
            //         if (!loggedCallIDs.has(item.id)) {
            //             $('#sip-ongoing').empty();
            //             $('#sip-ongoing').append(logItem);
            //             loggedCallIDs.add(item.id);
            //             startCallTimer(item.id);
            //             $('#callTimer').show();
            //         }
            //     }

            //     // Update call timers if necessary
            //     if (item.status === 'answered') {
            //         var tEle = document.getElementById(item.id);
            //         ctxSip.callTimers[item.id] = new Stopwatch(tEle);
            //         ctxSip.callTimers[item.id].start();
            //     }
            //     if (callActive && item.status !== 'ringing') {
            //         ctxSip.callTimers[item.id].start({ startTime: item.start });
            //     }

            //     $('#sip-ongoing').scrollTop(0);

            //     // Start the stopwatch timer when a call is answered or resumed
            //     if (item.status === 'answered' || item.status === 'resumed') {
            //         startStopwatchTimer(item.id);
            //     }

            //     // Stop the stopwatch timer when the call ends
            //     if (item.status === 'ended') {
            //         stopStopwatchTimer(item.id);
            //     }
            // },





            logIncomeCall: function (item) {
                var callIconSrc = item.direction === 'incoming' ? '../img/income.png' : '../img/outboundm.png';
                var cllMode;
                var callActive = (item.status !== 'ended' && item.status !== 'missed'),
                    callLength = (item.status !== 'ended') ? '<span id="' + item.id + '"></span>' : moment.duration(item.stop - item.start).humanize(),
                    callClass = '';

                switch (item.status) {
                    case 'ringing':
                        callClass = 'list-group-item-success';
                        callIconSrc = '../img/ringing.png';
                        cllMode = 'ringing';
                        break;
                    case 'missed':
                        callClass = 'list-group-item-danger';
                        if (item.flow === "incoming") { callIconSrc = '../img/inmissed.png'; cllMode = 'incoming'; }
                        if (item.flow === "outgoing") { callIconSrc = '../img/outmissed.png'; cllMode = 'outgoing'; }
                        break;
                    case 'holding':
                        callClass = 'list-group-item-warning';
                        callIconSrc = '../img/holding.png';
                        cllMode = 'holding';
                        break;
                    case 'answered':
                    case 'resumed':
                        callClass = 'list-group-item-info';
                        callIconSrc = '../img/answered.png';
                        cllMode = 'answered';
                        break;
                    case 'ended':
                        if (item.flow === "incoming") { callIconSrc = '../img/incoming.png'; cllMode = 'incoming'; }
                        if (item.flow === "outgoing") { callIconSrc = '../img/outgoing.png'; cllMode = 'outgoing'; }
                        cllMode = 'ended';
                        break;
                }

                var logItem = '<div class="list-group-item sip-logitem clearfix ' + callClass + '" data-uri="' + item.uri + '" data-sessionid="' + item.id + '" title="Double Click to Call"><div class="align-items-center"><div class="sip-ongoing">';
                logItem += '<div class="clearfix"><div class="row-callactive"><div class="d-flex">';
                logItem += '<div class="pull-right text-right text-right-callactive"><br><img src="../img/onCall.png" class="icon" alt="call icon" style="width: 150px; height: 150px; margin-bottom: 20px;"><br><strong class="name-text"  style="margin-bottom: 10px;">' + item.clid + '</strong><br><strong class="status-text">' + cllMode + '</strong><div id="callTimer" class="callTimer"  style="display: none;"></div><br>';

                if (callActive) {
                    logItem += '<div class="btn-group btn-group-xs pull-right">';
                    if (item.status === 'ringing' && item.flow === 'incoming') {
                        logItem += '<button class="btn btn-xs btn-success btnCall" title="Call"><i class="fa fa-phone"></i></button>';
                    } else {
                        logItem += '<button class="btn btn-xs btn-primary btnHoldResume" title="Hold" style="margin-right: 10px; width:35px; height:35px;"><i class="fa fa-pause"></i></button>';
                        logItem += '<button class="btn btn-xs btn-info btnTransfer" title="Transfer" style="margin-right: 10px; width:35px; height:35px;"><i class="fa fa-random"></i></button>';
                        logItem += '<button class="btn btn-xs btn-warning btnMute" title="Mute" style="margin-right: 10px; width:35px; height:35px;"><i class="fa fa-fw fa-microphone"></i></button>';
                    }
                    logItem += '<button class="btn btn-xs btn-danger btnHangUp" title="Hangup" style="width:35px; height:35px;"><i class="fa fa-stop"></i></button>';
                    logItem += '</div>';
                }
                // logItem += '<div class="callTimer" data-sessionid="' + item.id + '" style="font-size: 20px; margin-bottom: 10px;">0:00</div>';
                logItem += '</div></div></div></div></div></div></div>';

                // If the call is answered or resumed, show only the active log
                if (item.status === 'answered' || item.status === 'resumed') {
                    if (!loggedCallIDs.has(item.id)) {
                        $('#sip-ongoing').empty();
                        $('#sip-ongoing').append(logItem);
                        loggedCallIDs.add(item.id);
                        startCallTimer(item.id);
                        $('#callTimer').show();
                        if (!ctxSip.callTimers[item.id]) {
                            var tEle = document.getElementById(item.id);
                            ctxSip.callTimers[item.id] = new Stopwatch(tEle);
                            ctxSip.callTimers[item.id].start({ startTime: item.start });
                            console.log("Started timer for call ID: ", item.id);
                        } else {
                            console.error("Timer already exists for call ID: ", item.id);
                        }
                    }
                }

                // Update call timers if necessary
                // if (item.status === 'answered' && !ctxSip.callTimers[item.id]) {
                //     var tEle = document.getElementById(item.id);
                //     if (tEle) {
                //         ctxSip.callTimers[item.id] = new Stopwatch(tEle);
                //         ctxSip.callTimers[item.id].start();
                //         console.log("Started timer for call ID: ", item.id);
                //     } else {
                //         console.error("Element with ID: ", item.id, " not found.");
                //     }
                // }

                // if (callActive && item.status !== 'ringing' && !ctxSip.callTimers[item.id]) {
                //     if (ctxSip.callTimers[item.id]) {
                //         ctxSip.callTimers[item.id].start({ startTime: item.start });
                //         console.log("Started timer with start time for call ID: ", item.id);
                //     } else {
                //         console.error("Timer not found for call ID: ", item.id);
                //     }
                // }

                $('#sip-ongoing').scrollTop(0);
                

               

                if (item.status === 'bye') {
                    // Stop the Stopwatch instance associated with the call
                    if (ctxSip.callTimers[item.id]) {
                        ctxSip.callTimers[item.id].stop();
                        stopCallTimer();
                        console.log("Stopped timer for call ID: ", item.id);
                        $('#btnDashboard').click();
                       
                    } else {
                        console.error("Timer not found for call ID: ", item.id);
                        stopCallTimer();
                        resetCallTimer();
                    }

                    // Hide the call timer and perform any additional cleanup
                    stopCallTimer();
                    resetCallTimer();
                    $('#callTimer').hide();
                    $('#btnDashboard').click();
                    $('.btnHoldResume, .btnTransfer, .btnMute, .btnHangUp').hide();
                }
            },


            logOutGoingCall: function (item) {
                var callIconSrc;
                var cllMode;
                var callActive = (item.status !== 'ended' && item.status !== 'missed'),
                    callLength = (item.status !== 'ended') ? '<span id="' + item.id + '"></span>' : moment.duration(item.stop - item.start).humanize(),
                    callClass = '';

                switch (item.status) {
                    case 'ringing':
                        callClass = 'list-group-item-success';
                        callIconSrc = '../img/ringing.png';
                        cllMode = 'ringing';
                        break;
                    case 'missed':
                        callClass = 'list-group-item-danger';
                        if (item.flow === "incoming") { callIconSrc = '../img/inmissed.png'; cllMode = 'incoming'; }
                        if (item.flow === "outgoing") { callIconSrc = '../img/outmissed.png'; cllMode = 'outgoing'; }
                        break;
                    case 'holding':
                        callClass = 'list-group-item-warning';
                        callIconSrc = '../img/holding.png';
                        cllMode = 'holding';
                        break;
                    case 'answered':
                    case 'resumed':
                        callClass = 'list-group-item-info';
                        callIconSrc = '../img/answered.png';
                        cllMode = 'answered';
                        break;
                    case 'ended':
                        if (item.flow === "incoming") { callIconSrc = '../img/incoming.png'; cllMode = 'incoming'; }
                        if (item.flow === "outgoing") { callIconSrc = '../img/outgoing.png'; cllMode = 'outgoing'; }
                        break;
                }

                var logItem = '<div class="list-group-item sip-logitem clearfix ' + callClass + '" data-uri="' + item.uri + '" data-sessionid="' + item.id + '" title="Double Click to Call"><div class="align-items-center"><div class="sip-ongoing">';
                logItem += '<div class="clearfix"><div class="row-callactive"><div class="d-flex">';
                logItem += '<div class="pull-right text-right text-right-callactive"><strong style="margin-bottom: 10px;">Unknown</strong><br><img src="../img/outboundm.png" class="icon" alt="call icon" style="width: 150px; height: 150px; margin-bottom: 20px;"><br><strong class="name-text"  style="margin-bottom: 10px;">' + item.clid + '</strong><br><strong class="status-text">' + cllMode + '</strong><br>';

                if (callActive) {
                    logItem += '<div class="btn-group btn-group-xs pull-right">';
                    if (item.status === 'ringing' && item.flow === 'incoming') {
                        logItem += '<button class="btn btn-xs btn-success btnCall" title="Call"><i class="fa fa-phone"></i></button>';
                    } else {
                        logItem += '<button class="btn btn-xs btn-primary btnHoldResume" title="Hold" style="margin-right: 10px;"><i class="fa fa-pause"></i></button>';
                        logItem += '<button class="btn btn-xs btn-info btnTransfer" title="Transfer" style="margin-right: 10px;"><i class="fa fa-random"></i></button>';
                        logItem += '<button class="btn btn-xs btn-warning btnMute" title="Mute" style="margin-right: 10px;"><i class="fa fa-fw fa-microphone"></i></button>';
                    }
                    logItem += '<button class="btn btn-xs btn-danger btnHangUp" title="Hangup"><i class="fa fa-stop"></i></button>';
                    logItem += '</div>';
                }
                logItem += '<div class="callTimer" data-sessionid="' + item.id + '" style="font-size: 20px; margin-bottom: 10px;">0:00</div>';
                logItem += '</div></div></div></div></div></div></div>';

                // If the call is answered or resumed, show only the active log
                if (item.status === 'answered' || item.status === 'resumed') {
                    if (!loggedCallIDs.has(item.id)) {
                        $('#sip-outgoing').empty();
                        $('#sip-outgoing').append(logItem);
                        loggedCallIDs.add(item.id);
                        startCallTimer(item.id);
                        $('#callTimer').show();
                        if (!ctxSip.callTimers[item.id]) {
                            var tEle = document.getElementById(item.id);
                            ctxSip.callTimers[item.id] = new Stopwatch(tEle);
                            ctxSip.callTimers[item.id].start({ startTime: item.start });
                            console.log("Started timer for call ID: ", item.id);
                        } else {
                            console.error("Timer already exists for call ID: ", item.id);
                        }
                    }
                }

                // Update call timers if necessary
                if (item.status === 'answered' && !ctxSip.callTimers[item.id]) {
                    var tEle = document.getElementById(item.id);
                    if (tEle) {
                        ctxSip.callTimers[item.id] = new Stopwatch(tEle);
                        ctxSip.callTimers[item.id].start();
                        console.log("Started timer for call ID: ", item.id);
                    } else {
                        console.error("Element with ID: ", item.id, " not found.");
                    }
                }

                if (callActive && item.status !== 'ringing' && !ctxSip.callTimers[item.id]) {
                    if (ctxSip.callTimers[item.id]) {
                        ctxSip.callTimers[item.id].start({ startTime: item.start });
                        console.log("Started timer with start time for call ID: ", item.id);
                    } else {
                        console.error("Timer not found for call ID: ", item.id);
                    }
                }

                $('#sip-outgoing').scrollTop(0);

                if (item.status === 'bye') {
                    // Stop the Stopwatch instance associated with the call
                    if (ctxSip.callTimers[item.id]) {
                        ctxSip.callTimers[item.id].stop();
                        console.log("Stopped timer for call ID: ", item.id);
                    } else {
                        console.error("Timer not found for call ID: ", item.id);
                    }

                    // Hide the call timer and perform any additional cleanup
                    stopCallTimer();
                    $('#callTimer').hide();
                    $('#btnDashboard').click();
                }
            },




            logItem: function (item) {

                var callIconSrc;
                var cllMode;

                var callActive = (item.status !== 'ended' && item.status !== 'missed'),
                    callLength = (item.status !== 'ended') ? '<span id="' + item.id + '"></span>' : moment.duration(item.stop - item.start).humanize(),
                    callClass = '',
                    callIcon,
                    i;
                switch (item.status) {
                    case 'ringing':
                        callClass = 'list-group-item-success';
                        callIcon = 'fa-bell';
                        break;
                    case 'missed':
                        callClass = 'list-group-item-danger';
                        if (item.flow === "incoming") { callIconSrc = '../img/incoming.png'; cllMode = 'incoming'; }
                        if (item.flow === "outgoing") { callIconSrc = '../img/incoming.png'; cllMode = 'outgoing'; }
                        break;
                    case 'holding':
                        callClass = 'list-group-item-warning';
                        callIcon = 'fa-pause';
                        break;
                    case 'answered':
                    case 'resumed':
                        callClass = 'list-group-item-info';
                        callIcon = 'fa-phone-square';
                        break;
                    case 'ended':
                        if (item.flow === "incoming") { callIconSrc = '../img/incoming.png'; cllMode = 'incoming'; }
                        if (item.flow === "outgoing") { callIconSrc = '../img/outgoing.png'; cllMode = 'outgoing'; }
                        break;
                }
                i = '<div class="list-group-item sip-logitem clearfix ' + callClass + '" data-uri="' + item.uri + '" data-sessionid="' + item.id + '" title="Double Click to Call">';
                i += '<div class="clearfix"><div class="d-flex">';
                i += '<div class="pull-right text-right"><strong>Unknown</strong><br></div>';
                i += '<div class="align-items-center"><img src="' + callIconSrc + '" class="icon" alt="call icon" style="width: 20px; height: 20px;  margin-right: 5px;"> <strong>' + cllMode + '</strong>';
                i += '</div>';
                i += '<div class="pull-right text-right"><strong>' + moment(item.start).format('MM/DD hh:mm:ss a') + '</strong><br>' + callLength + '</div></div></div>';
                if (callActive) {
                    i += '<div class="btn-group btn-group-xs pull-right">';
                    if (item.status === 'ringing' && item.flow === 'incoming') {
                        i += '<button class="btn btn-xs btn-success btnCall" title="Call"><i class="fa fa-phone"></i></button>';
                    } else {
                        i += '<button class="btn btn-xs btn-primary btnHoldResume" title="Hold"><i class="fa fa-pause"></i></button>';
                        i += '<button class="btn btn-xs btn-info btnTransfer" title="Transfer"><i class="fa fa-random"></i></button>';
                        i += '<button class="btn btn-xs btn-warning btnMute" title="Mute"><i class="fa fa-fw fa-microphone"></i></button>';
                    }
                    i += '<button class="btn btn-xs btn-danger btnHangUp" title="Hangup"><i class="fa fa-stop"></i></button>';
                    i += '</div>';
                }
                i += '</div>';


                $('#sip-logitems').append(i);

                if (item.flow === 'incoming') {
                    $('#sip-inbound-logitems').append(i);
                } else if (item.flow === 'outgoing') {
                    $('#sip-outbound-logitems').append(i);
                } else if (item.status === 'missed') {
                    $('#sip-missed-logitems').append(i);
                }

                if (item.status === 'answered' || item.status === 'resumed') {
                    $('#sip-inbound-logitems').append(i);
                }

                if (item.status === 'answered') {
                    var tEle = document.getElementById(item.id);
                    ctxSip.callTimers[item.id] = new Stopwatch(tEle);
                    ctxSip.callTimers[item.id].start();
                }
                if (callActive && item.status !== 'ringing') {
                    ctxSip.callTimers[item.id].start({ startTime: item.start });
                }
                $('#sip-logitems').scrollTop(0);
                $('#sip-inbound-logitems').scrollTop(0);
                $('#sip-outbound-logitems').scrollTop(0);
                $('#sip-missed-logitems').scrollTop(0);
                // $('#sip-ongoing').scrollTop(0);
            },

            logShow: function () {
                var calllog = JSON.parse(localStorage.getItem('sipCalls')),
                    x = [];
                if (calllog !== null) {
                    $('#sip-splash').addClass('hide');
                    $('#sip-log').removeClass('hide');
                    $('#sip-logitems').empty();
                    $('#sip-outbound-logitems').empty();
                    $.each(calllog, function (k, v) {
                        x.push(v);
                    });
                    x.sort(function (a, b) {
                        return b.start - a.start;
                    });
                    $.each(x, function (k, v) {
                        ctxSip.logItem(v);
                        ctxSip.logIncomeCall(v);
                    });
                } else {
                    $('#sip-splash').removeClass('hide');
                    $('#sip-log').addClass('hide');
                }
            },

            logIncomeCallShow: function () {
                var calllog = JSON.parse(localStorage.getItem('sipCalls')),
                    x = [];
                if (calllog !== null) {
                    $('#sip-splash').addClass('hide');
                    $('#sip-log').removeClass('hide');
                    $('#sip-ongoing').empty();

                    $.each(calllog, function (k, v) {
                        x.push(v);
                    });
                    x.sort(function (a, b) {
                        return b.start - a.start;
                    });
                    $.each(x, function (k, v) {
                        ctxSip.logItem(v);
                        ctxSip.logIncomeCall(v);
                    });
                } else {
                    $('#sip-splash').removeClass('hide');
                    $('#sip-log').addClass('hide');
                }
            },




            logClear: function () {
                localStorage.removeItem('sipCalls');
                ctxSip.logShow();
                ctxSip.logIncomeCallShow();
            },



            sipCall: function (target) {
                try {
                    var s = ctxSip.phone.invite(target, {
                        media: {
                            stream: ctxSip.Stream,
                            constraints: { audio: true, video: false },
                            render: {
                                remote: $('#audioRemote').get()[0]
                            },
                            RTCConstraints: { "optional": [{ 'DtlsSrtpKeyAgreement': 'true' }] }
                        }
                    });
                    s.direction = 'outgoing';
                    ctxSip.newSession(s);
                } catch (e) {
                    throw (e);
                }
            },


            sipTransfer: function (sessionid) {
                var s = ctxSip.Sessions[sessionid],
                    target = window.prompt('Enter destination number', '');
                ctxSip.setCallSessionStatus('<i>Transferring the call...</i>');
                s.refer(target);
            },

            sipHangUp: function (sessionid) {
                var s = ctxSip.Sessions[sessionid];
                if (!s) {
                    return;
                } else if (s.startTime) {
                    s.bye();
                } else if (s.reject) {
                    s.reject();
                } else if (s.cancel) {
                    s.cancel();
                }
            },

            sipSendDTMF: function (digit) {
                try { ctxSip.dtmfTone.play(); } catch (e) { }
                var a = ctxSip.callActiveID;
                if (a) {
                    var s = ctxSip.Sessions[a];
                    s.dtmf(digit);
                }
            },

            phoneCallButtonPressed: function (sessionid) {
                var s = ctxSip.Sessions[sessionid],
                    target = $("#numDisplay").val();
                if (!s) {
                    $("#numDisplay").val("");
                    ctxSip.sipCall(target);
                } else if (s.accept && !s.startTime) {
                    s.accept({
                        media: {
                            stream: ctxSip.Stream,
                            constraints: { audio: true, video: false },
                            render: {
                                remote: { audio: $('#audioRemote').get()[0] }
                            },
                            RTCConstraints: { "optional": [{ 'DtlsSrtpKeyAgreement': 'true' }] }
                        }
                    });
                }
            },

            phoneMuteButtonPressed: function (sessionid) {
                var s = ctxSip.Sessions[sessionid];
                if (!s.isMuted) {
                    s.mute();
                } else {
                    s.unmute();
                }
            },

            phoneHoldButtonPressed: function (sessionid) {
                var session = ctxSip.Sessions[sessionid];
                if (session.isOnHold().local) {
                    session.unhold();
                } else {
                    session.hold();
                }
            },


            setError: function (err, title, msg, closable) {
                if (err === true) {
                    $("#mdlError p").html(msg);
                    $("#mdlError").modal('show');
                    if (closable) {
                        var b = '<button type="button" class="close" data-dismiss="modal">&times;</button>';
                        $("#mdlError .modal-header").find('button').remove();
                        $("#mdlError .modal-header").prepend(b);
                        $("#mdlError .modal-title").html(title);
                        $("#mdlError").modal({ keyboard: true });
                    } else {
                        $("#mdlError .modal-header").find('button').remove();
                        $("#mdlError .modal-title").html(title);
                        $("#mdlError").modal({ keyboard: false });
                    }
                    $('#numDisplay').prop('disabled', 'disabled');
                } else {
                    $('#numDisplay').removeProp('disabled');
                    $("#mdlError").modal('hide');
                }
            },

            hasWebRTC: function () {
                if (navigator.webkitGetUserMedia) {
                    return true;
                } else if (navigator.mozGetUserMedia) {
                    return true;
                } else if (navigator.getUserMedia) {
                    return true;
                } else {
                    ctxSip.setError(true, 'Unsupported Browser.', 'Your browser does not support the features required for this phone.');
                    window.console.error("WebRTC support not found");
                    return false;
                }
            }


        };
        ctxSip.logShow();

        setInterval(function () {
            ctxSip.logShow();
        }, 5000);

        // $('#btnKeyPad').click(function () {
        //     $('#keypadContainer').removeClass('hidden');
        //     $('#inboundCallLog').addClass('hidden');
        //     $('#outboundCallLog').addClass('hidden');
        //     $('#missedCallLog').addClass('hidden');
        // });

        // $('#btnIncoming').click(function () {
        //     $('#keypadContainer').addClass('hidden');
        //     $('#inboundCallLog').removeClass('hidden');
        //     $('#outboundCallLog').addClass('hidden');
        //     $('#missedCallLog').addClass('hidden');
        // });

        // $('#btnOutbound').click(function () {
        //     $('#keypadContainer').addClass('hidden');
        //     $('#inboundCallLog').addClass('hidden');
        //     $('#outboundCallLog').removeClass('hidden');
        //     $('#missedCallLog').addClass('hidden');
        // });

        // Throw an error if the browser can't hack it.
        if (!ctxSip.hasWebRTC()) {
            return true;
        }


        ctxSip.phone = new SIP.UA(ctxSip.config);

        ctxSip.phone.on('connected', function (e) {
            ctxSip.setStatus("Connected");
        });

        ctxSip.phone.on('disconnected', function (e) {
            ctxSip.setStatus("Disconnected");
            ctxSip.setError(true, 'Websocket Disconnected.', 'An Error occurred connecting to the websocket.');
            $("#sessions > .session").each(function (i, session) {
                ctxSip.removeSession(session, 500);
            });
        });

        ctxSip.phone.on('registered', function (e) {
            var closeEditorWarning = function () {
                return 'If you close this window, you will not be able to make or receive calls from your browser.';
            };
            var closePhone = function () {
                localStorage.removeItem('ctxPhone');
                ctxSip.phone.stop();
            };
            window.onbeforeunload = closeEditorWarning;
            window.onunload = closePhone;
            localStorage.setItem('ctxPhone', 'true');
            $("#mldError").modal('hide');
            ctxSip.setStatus("Ready");
            if (SIP.WebRTC.isSupported()) {
                SIP.WebRTC.getUserMedia({ audio: true, video: false }, ctxSip.getUserMediaSuccess, ctxSip.getUserMediaFailure);
            }
            // Change button text to "SIP Registered"
            $('#btnDemo').text('Registered');
        });

        ctxSip.phone.on('registrationFailed', function (e) {
            ctxSip.setError(true, 'Registration Error.', 'An Error occurred registering your phone. Check your settings.');
            ctxSip.setStatus("Error: Registration Failed");
        });

        ctxSip.phone.on('unregistered', function (e) {
            ctxSip.setError(true, 'Registration Error.', 'An Error occurred registering your phone. Check your settings.');
            ctxSip.setStatus("Error: Registration Failed");
        });

        ctxSip.phone.on('invite', function (incomingSession) {
            var s = incomingSession;
            s.direction = 'incoming';
            ctxSip.newSession(s);
            showIncomingCallModal(s); // Show the modal when there's an incoming call
        });

        // Handle in-call controls
        $('#muteCall').click(function () {
            var session = ctxSip.Sessions[ctxSip.callActiveID];
            if (session) {
                session.mute();
                $('#muteCall').hide();
                $('#unmuteCall').show();
            }
        });

        $('#unmuteCall').click(function () {
            var session = ctxSip.Sessions[ctxSip.callActiveID];
            if (session) {
                session.unmute();
                $('#muteCall').show();
                $('#unmuteCall').hide();
            }
        });

        $('#holdCall').click(function () {
            var session = ctxSip.Sessions[ctxSip.callActiveID];
            if (session) {
                session.hold();
                $('#holdCall').hide();
                $('#unholdCall').show();
            }
        });

        $('#unholdCall').click(function () {
            var session = ctxSip.Sessions[ctxSip.callActiveID];
            if (session) {
                session.unhold();
                $('#holdCall').show();
                $('#unholdCall').hide();
            }
        });

        $('#transferCall').click(function () {
            var session = ctxSip.Sessions[ctxSip.callActiveID];
            if (session) {
                var target = window.prompt('Enter destination number', '');
                if (target) {
                    session.refer(target);
                }
            }
        });

        $('#endCall').click(function () {
            var session = ctxSip.Sessions[ctxSip.callActiveID];
            if (session) {
                session.bye();
                stopCallTimer();
                $('#callTimer').hide();
                $('#btnDashboard').click();
                $('#inCallControls').hide();
                $('#sip-ongoing').addClass('hide');
                
            }
        });

        $('#sipClient').keydown(function (event) {
            if (event.which === 8) {
                $('#numDisplay').focus();
            }
        });

        $('#numDisplay').keypress(function (e) {
            if (e.which === 13) {
                ctxSip.phoneCallButtonPressed();
            }
        });

        $('.digit').click(function (event) {
            event.preventDefault();
            var num = $('#numDisplay').val(),
                dig = $(this).data('digit');
            $('#numDisplay').val(num + dig);
            ctxSip.sipSendDTMF(dig);
            return false;
        });

        $('#phoneUI .dropdown-menu').click(function (e) {
            e.preventDefault();
        });

        $('#phoneUI').delegate('.btnCall', 'click', function (event) {
            ctxSip.phoneCallButtonPressed();
            return true;
        });

        $('.sipLogClear').click(function (event) {
            event.preventDefault();
            ctxSip.logClear();
        });

        $('#sip-logitems').delegate('.sip-logitem .btnCall', 'click', function (event) {
            var sessionid = $(this).closest('.sip-logitem').data('sessionid');
            ctxSip.phoneCallButtonPressed(sessionid);
            return false;
        });

        $('#sip-logitems').delegate('.sip-logitem .btnHoldResume', 'click', function (event) {
            var sessionid = $(this).closest('.sip-logitem').data('sessionid');
            ctxSip.phoneHoldButtonPressed(sessionid);
            var button = $(this);
            if (button.hasClass('btn-primary')) {
                button.removeClass('btn-primary').addClass('btn-success').attr('title', 'Unhold').html('<i class="fa fa-play"></i>');
            } else {
                button.removeClass('btn-success').addClass('btn-primary').attr('title', 'Hold').html('<i class="fa fa-pause"></i >');
            }
            return false;
        });

        $('#sip-logitems').delegate('.sip-logitem .btnHangUp', 'click', function (event) {
            var sessionid = $(this).closest('.sip-logitem').data('sessionid');
            ctxSip.sipHangUp(sessionid);
            stopCallTimer();
                    resetCallTimer();
                    $('#callTimer').hide();
            return false;
        });

        $('#sip-logitems').delegate('.sip-logitem .btnTransfer', 'click', function (event) {
            var sessionid = $(this).closest('.sip-logitem').data('sessionid');
            ctxSip.sipTransfer(sessionid);
            return false;
        });

        $('#sip-logitems').delegate('.sip-logitem .btnMute', 'click', function (event) {
            var sessionid = $(this).closest('.sip-logitem').data('sessionid');
            ctxSip.phoneMuteButtonPressed(sessionid);
            return false;
        });

        $('#sip-logitems').delegate('.sip-logitem', 'dblclick', function (event) {
            event.preventDefault();
            var uri = $(this).data('uri');
            $('#numDisplay').val(uri);
            ctxSip.phoneCallButtonPressed();
        });

        // sip ongoping items

        // sip ongoing items
        $('#sip-ongoing').delegate('.btnCall', 'click', function (event) {
            var sessionid = $(this).closest('.sip-logitem').data('sessionid');
            ctxSip.sipCall(sessionid);
            return false;
        });

        $('#sip-ongoing').delegate('.btnHoldResume', 'click', function (event) {
            var sessionid = $(this).closest('.sip-logitem').data('sessionid');
            ctxSip.phoneHoldButtonPressed(sessionid);
            var button = $(this);
            if (button.hasClass('btn-primary')) {
                button.removeClass('btn-primary').addClass('btn-success').attr('title', 'Unhold').html('<i class="fa fa-play"></i>');
                stopStopwatchTimer(sessionid); // Stop the timer when on hold
            } else {
                button.removeClass('btn-success').addClass('btn-primary').attr('title', 'Hold').html('<i class="fa fa-pause"></i>');
                startStopwatchTimer(sessionid); // Start the timer when resumed
            }
            return false;
        });

        $('#sip-ongoing').delegate('.btnHangUp', 'click', function (event) {
            var sessionid = $(this).closest('.sip-logitem').data('sessionid');
            ctxSip.sipHangUp(sessionid);
            stopStopwatchTimer(sessionid); // Stop the timer when the call is hung up
            stopCallTimer();
                    resetCallTimer();
                    $('#callTimer').hide();
            return false;
        });

        $('#sip-ongoing').delegate('.btnTransfer', 'click', function (event) {
            var sessionid = $(this).closest('.sip-logitem').data('sessionid');
            ctxSip.sipTransfer(sessionid);
            return false;
        });

        $('#sip-ongoing').delegate('.btnMute', 'click', function (event) {
            var sessionid = $(this).closest('.sip-logitem').data('sessionid');
            ctxSip.phoneMuteButtonPressed(sessionid);
            return false;
        });

        // end ongoing items

        // sip outgoing items
        $('#sip-outgoing').delegate('.btnCall', 'click', function (event) {
            var sessionid = $(this).closest('.sip-logitem').data('sessionid');
            ctxSip.sipCall(sessionid);
            return false;
        });

        $('#sip-outgoing').delegate('.btnHoldResume', 'click', function (event) {
            var sessionid = $(this).closest('.sip-logitem').data('sessionid');
            ctxSip.phoneHoldButtonPressed(sessionid);
            var button = $(this);
            if (button.hasClass('btn-primary')) {
                button.removeClass('btn-primary').addClass('btn-success').attr('title', 'Unhold').html('<i class="fa fa-play"></i>');
                stopStopwatchTimer(sessionid); // Stop the timer when on hold
            } else {
                button.removeClass('btn-success').addClass('btn-primary').attr('title', 'Hold').html('<i class="fa fa-pause"></i>');
                startStopwatchTimer(sessionid); // Start the timer when resumed
            }
            return false;
        });

        $('#sip-outgoing').delegate('.btnHangUp', 'click', function (event) {
            var sessionid = $(this).closest('.sip-logitem').data('sessionid');
            ctxSip.sipHangUp(sessionid);
            stopStopwatchTimer(sessionid); // Stop the timer when the call is hung up
            return false;
        });

        $('#sip-outgoing').delegate('.btnTransfer', 'click', function (event) {
            var sessionid = $(this).closest('.sip-logitem').data('sessionid');
            ctxSip.sipTransfer(sessionid);
            return false;
        });

        $('#sip-outgoing').delegate('.btnMute', 'click', function (event) {
            var sessionid = $(this).closest('.sip-logitem').data('sessionid');
            ctxSip.phoneMuteButtonPressed(sessionid);
            return false;
        });

        // end outgoing items



        // end ongoing items

        $('#btnCall').click(function () {
            var target = $("#numDisplay").val();
            if (target) {
                ctxSip.sipCall(target);
                showOutgoingCallModal(target); // Show outgoing call modal
            }
        });

        $('#sldVolume').on('change', function () {
            var v = $(this).val() / 100,
                btn = $('#btnVol'),
                icon = $('#btnVol').find('i'),
                active = ctx
            var active = ctxSip.callActiveID;
            if (ctxSip.Sessions[active]) {
                ctxSip.Sessions[active].player.volume = v;
                ctxSip.callVolume = v;
            }
            $('audio').each(function () {
                $(this).get()[0].volume = v;
            });
            if (v < 0.1) {
                btn.removeClass(function (index, css) {
                    return (css.match(/(^|\s)btn\S+/g) || []).join(' ');
                }).addClass('btn btn-sm btn-danger');
                icon.removeClass().addClass('fa fa-fw fa-volume-off');
            } else if (v < 0.8) {
                btn.removeClass(function (index, css) {
                    return (css.match(/(^|\s)btn\S+/g) || []).join(' ');
                }).addClass('btn btn-sm btn-info');
                icon.removeClass().addClass('fa fa-fw fa-volume-down');
            } else {
                btn.removeClass(function (index, css) {
                    return (css.match(/(^|\s)btn\S+/g) || []).join(' ');
                }).addClass('btn btn-sm btn-primary');
                icon.removeClass().addClass('fa fa-fw fa-volume-up');
            }
            return false;
        });

        setTimeout(function () {
            ctxSip.logShow();
        }, 3000);

        var Stopwatch = function (elem, options) {
            function createTimer() {
                return document.createElement("span");
            }
            var timer = createTimer(),
                offset,
                clock,
                interval;
            options = options || {};
            options.delay = options.delay || 1000;
            options.startTime = options.startTime || Date.now();
            elem.appendChild(timer);

            function start() {
                if (!interval) {
                    offset = options.startTime;
                    interval = setInterval(update, options.delay);
                }
            }

            function stop() {
                if (interval) {
                    clearInterval(interval);
                    interval = null;
                }
            }

            function reset() {
                clock = 0;
                render();
            }

            function update() {
                clock += delta();
                render();
            }

            function render() {
                timer.innerHTML = moment(clock).format('mm:ss');
            }

            function delta() {
                var now = Date.now(),
                    d = now - offset;
                offset = now;
                return d;
            }

            reset();
            this.start = start;
            this.stop = stop;
        };
    }

    var callStartTime;
    var callTimerInterval;
    function startStopwatchTimer(sessionid) {
        var timerElement = $('#sip-ongoing .callTimer[data-sessionid="' + sessionid + '"]');
        var startTime = Date.now();
        var intervalId = setInterval(function () {
            var elapsedTime = Date.now() - startTime;
            var minutes = Math.floor(elapsedTime / 60000);
            var seconds = Math.floor((elapsedTime % 60000) / 1000);
            timerElement.text(minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
        }, 1000);

        // Store the interval ID in the session object to stop the timer later
        ctxSip.Sessions[sessionid].timerIntervalId = intervalId;
    }

    function stopStopwatchTimer(sessionid) {
        var session = ctxSip.Sessions[sessionid];
        if (session && session.timerIntervalId) {
            clearInterval(session.timerIntervalId);
            delete session.timerIntervalId;
        }
    }


    function startCallTimer(callId) {
        var timerElement = document.getElementById('call-timer-' + callId);
        var startTime = Date.now();

        setInterval(function () {
            var elapsedTime = Date.now() - startTime;
            var hours = Math.floor(elapsedTime / 3600000);
            var minutes = Math.floor((elapsedTime % 3600000) / 60000);
            var seconds = Math.floor((elapsedTime % 60000) / 1000);

            hours = hours.toString().padStart(2, '0');
            minutes = minutes.toString().padStart(2, '0');
            seconds = seconds.toString().padStart(2, '0');

            timerElement.textContent = hours + ':' + minutes + ':' + seconds;
        }, 1000);
    }

    function showIncomingCallModal(session) {
        $('#incomingCallInfo').text(`Incoming call from: ${session.remoteIdentity.displayName || session.remoteIdentity.uri.user}`);
        $('#incomingCallModal').modal('show');

        $('#callActions').show();
        $('#inCallActions').hide();
        $('#incomecallImage').show();
        $('#incomingCallNumber').hide();

        $('#answerCall').off('click').on('click', function () {
            session.accept({
                media: {
                    stream: ctxSip.Stream,
                    constraints: { audio: true, video: false },
                    render: {
                        remote: $('#audioRemote').get()[0]
                    },
                    RTCConstraints: { "optional": [{ 'DtlsSrtpKeyAgreement': 'true' }] }
                }
            });

            // Hide the modal after answering the call
            $('#incomingCallModal').modal('hide');
            // Automatically navigate to Active call button
            $('#btnactivecall').click();
            // $('#inCallControls').show();
            // $('#incomingCallInfo').show();
            // $('#inCallActions').show();
            // $('#incomingCallNumber').text(`Call in progress: ${session.remoteIdentity.displayName || session.remoteIdentity.uri.user}`);
            // $('#showTransferCallRed').hide();

            resetCallTimer();
            startCallTimer();
        });

        $('#rejectCall').off('click').on('click', function () {
            session.reject();
            stopCallTimer();
            $('#incomingCallModal').modal('hide');
            $('#btnDashboard').click();
        });

        $('#holdCallModal').off('click').on('click', function () {
            session.hold();
            $('#holdCallModal').hide();
            $('#unholdCallModal').show();
        });

        $('#unholdCallModal').off('click').on('click', function () {
            session.unhold();
            $('#unholdCallModal').hide();
            $('#holdCallModal').show();
        });

        $('#showTransferCall').off('click').on('click', function () {
            session.hold();
            $('#transferCallInput').show();
            $('#showTransferCall').hide();
            $('#showTransferCallRed').show();
            $('#incomecallImage').hide();
        });

        $('#transferCall').off('click').on('click', function () {
            var target = $('#transferTarget').val();
            if (target) {
                session.refer(target);
                $('#transferCallInput').hide();
            }
        });

        $('#cancelTransfer').off('click').on('click', function () {
            session.unhold();
            $('#transferCallInput').hide();
            $('#incomecallImage').show();
            $('#showTransferCallRed').hide();
            $('#showTransferCall').show();
        });

        $('#endCallModal').off('click').on('click', function () {
            session.bye();
            stopCallTimer();
            $('#incomingCallModal').modal('hide');
            
            $('#btnDashboard').click();
        });

        session.on('bye', function () {
            $('#incomingCallModal').modal('hide');
            stopCallTimer();
            $('#inCallControls').hide(); // Hide in-call controls when the call ends
            $('#btnDashboard').click();
        });

        session.on('terminated', function () {
            $('#incomingCallModal').modal('hide');
            stopCallTimer();
            $('#inCallControls').hide(); // Hide in-call controls when the call ends
            $('#btnDashboard').click();
        });
    }

    // Handle in-call controls
    $('#muteCall').click(function () {
        var session = ctxSip.Sessions[ctxSip.callActiveID];
        if (session) {
            session.mute();
            $('#muteCall').hide();
            $('#unmuteCall').show();
        }
    });

    $('#unmuteCall').click(function () {
        var session = ctxSip.Sessions[ctxSip.callActiveID];
        if (session) {
            session.unmute();
            $('#muteCall').show();
            $('#unmuteCall').hide();
        }
    });

    $('#holdCall').click(function () {
        var session = ctxSip.Sessions[ctxSip.callActiveID];
        if (session) {
            session.hold();
            $('#holdCall').hide();
            $('#unholdCall').show();
        }
    });

    $('#unholdCall').click(function () {
        var session = ctxSip.Sessions[ctxSip.callActiveID];
        if (session) {
            session.unhold();
            $('#holdCall').show();
            $('#unholdCall').hide();
        }
    });

    $('#transferCall').click(function () {
        var session = ctxSip.Sessions[ctxSip.callActiveID];
        if (session) {
            var target = window.prompt('Enter destination number', '');
            if (target) {
                session.refer(target);
            }
        }
    });

    $('#endCall').click(function () {
        var session = ctxSip.Sessions[ctxSip.callActiveID];
        if (session) {
            session.bye();
            stopCallTimer();
            $('#inCallControls').hide();
            $('#btnDashboard').click();
        }

    });

    // Function to start the call timer
    function startCallTimer() {
        resetCallTimer();
        callStartTime = Date.now();
        callTimerInterval = setInterval(updateCallTimer, 1000);
    }

    // Function to update the call timer display
    function updateCallTimer() {
        var currentTime = Date.now();
        var elapsedTime = currentTime - callStartTime;

        var totalSeconds = Math.floor(elapsedTime / 1000);
        var minutes = Math.floor(totalSeconds / 60);
        var seconds = totalSeconds % 60;

        var timerDisplay = document.getElementById('callTimer');
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Function to stop the call timer
    function stopCallTimer() {
        clearInterval(callTimerInterval);
        resetCallTimer();
    }

    function resetCallTimer() {
        var timerDisplay = document.getElementById('callTimer');
        timerDisplay.textContent = "0:00";
    }

    // Handle incoming call modal and in-call controls
    $('#incomingCallModal').on('hidden.bs.modal', function () {
        $('#inCallControls').hide();
    });

    $('#answerCall').click(function () {
        $('#incomingCallModal').modal('hide');
        $('#inCallControls').show();
    });

    $('#rejectCall').click(function () {
        $('#incomingCallModal').modal('hide');
        stopCallTimer();
    });

    $('#muteCall').click(function () {
        var session = ctxSip.Sessions[ctxSip.callActiveID];
        if (session) {
            session.mute();
            $('#muteCall').hide();
            $('#unmuteCall').show();
        }
    });

    $('#unmuteCall').click(function () {
        var session = ctxSip.Sessions[ctxSip.callActiveID];
        if (session) {
            session.unmute();
            $('#muteCall').show();
            $('#unmuteCall').hide();
        }
    });

    $('#holdCall').click(function () {
        var session = ctxSip.Sessions[ctxSip.callActiveID];
        if (session) {
            session.hold();
            $('#holdCall').hide();
            $('#unholdCall').show();
        }
    });

    $('#unholdCall').click(function () {
        var session = ctxSip.Sessions[ctxSip.callActiveID];
        if (session) {
            session.unhold();
            $('#holdCall').show();
            $('#unholdCall').hide();
        }
    });

    $('#transferCall').click(function () {
        var session = ctxSip.Sessions[ctxSip.callActiveID];
        if (session) {
            var target = window.prompt('Enter destination number', '');
            if (target) {
                session.refer(target);
            }
        }
    });

    $('#endCall').click(function () {
        var session = ctxSip.Sessions[ctxSip.callActiveID];
        if (session) {
            session.bye();
            $('#inCallControls').hide();
            $('#btnDashboard').click();
            stopCallTimer();
        }
    });
});