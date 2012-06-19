var status = [];
status['150'] = '150 Accepted data connection\r\n';
status['211'] = '211-Feature listing\r\n211 End.\r\n';
status['221'] = '221 Thank you for using our service. Have a nice day!\r\n';
status['215'] = '215 This is a sytem.\r\n';
status['227'] = '227 Entered Passive Mode. '; // (i1,i2,i3,i4,p1,p2) follows
status['220'] = '220-Welcome to the FULL-JS-FTP Server.\r\n220-This service was authored by @dlaxar\r\n220 Hi!\r\n';
status['230'] = '230 You are now logged in!\r\n';
status['250'] = '250 File action OK. Your current directory is '; // current dir follows
status['331'] = '331 Username OK, need Password\r\n';
status['350'] = '215 File action OK. Need more information.\r\n';
status['430'] = '430 Invalid Username or Password\r\n';
status['450'] = '450 File action denied. '; // cause follows
status['500'] = '500 Command not recoginzed\r\n';
status['501'] = '501 Incorrect arguments or parameters\r\n';
status['503'] = '503 Wrong Sequence of commands\r\n';
status['550'] = '550 Dir/File not found/no access!\r\n';

exports.status = status;