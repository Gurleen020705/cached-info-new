// Comprehensive list of universities for the application
const universities = [
    // United States - Ivy League
    { name: 'Harvard University', country: 'United States', state: 'Massachusetts', type: 'Private' },
    { name: 'Yale University', country: 'United States', state: 'Connecticut', type: 'Private' },
    { name: 'Princeton University', country: 'United States', state: 'New Jersey', type: 'Private' },
    { name: 'Columbia University', country: 'United States', state: 'New York', type: 'Private' },
    { name: 'University of Pennsylvania', country: 'United States', state: 'Pennsylvania', type: 'Private' },
    { name: 'Brown University', country: 'United States', state: 'Rhode Island', type: 'Private' },
    { name: 'Dartmouth College', country: 'United States', state: 'New Hampshire', type: 'Private' },
    { name: 'Cornell University', country: 'United States', state: 'New York', type: 'Private' },

    // United States - Top Tech Schools
    { name: 'Massachusetts Institute of Technology (MIT)', country: 'United States', state: 'Massachusetts', type: 'Private' },
    { name: 'Stanford University', country: 'United States', state: 'California', type: 'Private' },
    { name: 'California Institute of Technology (Caltech)', country: 'United States', state: 'California', type: 'Private' },
    { name: 'Carnegie Mellon University', country: 'United States', state: 'Pennsylvania', type: 'Private' },
    { name: 'Georgia Institute of Technology', country: 'United States', state: 'Georgia', type: 'Public' },
    { name: 'University of California, Berkeley', country: 'United States', state: 'California', type: 'Public' },
    { name: 'University of Illinois Urbana-Champaign', country: 'United States', state: 'Illinois', type: 'Public' },
    { name: 'University of Michigan', country: 'United States', state: 'Michigan', type: 'Public' },
    { name: 'University of Texas at Austin', country: 'United States', state: 'Texas', type: 'Public' },
    { name: 'University of Washington', country: 'United States', state: 'Washington', type: 'Public' },

    // United States - Other Major Universities
    { name: 'University of California, Los Angeles (UCLA)', country: 'United States', state: 'California', type: 'Public' },
    { name: 'University of California, San Diego (UCSD)', country: 'United States', state: 'California', type: 'Public' },
    { name: 'University of Wisconsin-Madison', country: 'United States', state: 'Wisconsin', type: 'Public' },
    { name: 'University of North Carolina at Chapel Hill', country: 'United States', state: 'North Carolina', type: 'Public' },
    { name: 'Duke University', country: 'United States', state: 'North Carolina', type: 'Private' },
    { name: 'Johns Hopkins University', country: 'United States', state: 'Maryland', type: 'Private' },
    { name: 'Northwestern University', country: 'United States', state: 'Illinois', type: 'Private' },
    { name: 'New York University (NYU)', country: 'United States', state: 'New York', type: 'Private' },
    { name: 'Boston University', country: 'United States', state: 'Massachusetts', type: 'Private' },
    { name: 'University of Southern California (USC)', country: 'United States', state: 'California', type: 'Private' },

    // United States - State Universities
    { name: 'University of Florida', country: 'United States', state: 'Florida', type: 'Public' },
    { name: 'Ohio State University', country: 'United States', state: 'Ohio', type: 'Public' },
    { name: 'Pennsylvania State University', country: 'United States', state: 'Pennsylvania', type: 'Public' },
    { name: 'University of Virginia', country: 'United States', state: 'Virginia', type: 'Public' },
    { name: 'University of Minnesota', country: 'United States', state: 'Minnesota', type: 'Public' },
    { name: 'University of Arizona', country: 'United States', state: 'Arizona', type: 'Public' },
    { name: 'University of Colorado Boulder', country: 'United States', state: 'Colorado', type: 'Public' },
    { name: 'University of Utah', country: 'United States', state: 'Utah', type: 'Public' },
    { name: 'Texas A&M University', country: 'United States', state: 'Texas', type: 'Public' },
    { name: 'Purdue University', country: 'United States', state: 'Indiana', type: 'Public' },

    // United Kingdom
    { name: 'University of Oxford', country: 'United Kingdom', state: 'England', type: 'Public' },
    { name: 'University of Cambridge', country: 'United Kingdom', state: 'England', type: 'Public' },
    { name: 'Imperial College London', country: 'United Kingdom', state: 'England', type: 'Public' },
    { name: 'University College London (UCL)', country: 'United Kingdom', state: 'England', type: 'Public' },
    { name: 'University of Edinburgh', country: 'United Kingdom', state: 'Scotland', type: 'Public' },
    { name: 'University of Manchester', country: 'United Kingdom', state: 'England', type: 'Public' },
    { name: 'King\'s College London', country: 'United Kingdom', state: 'England', type: 'Public' },
    { name: 'London School of Economics (LSE)', country: 'United Kingdom', state: 'England', type: 'Public' },
    { name: 'University of Bristol', country: 'United Kingdom', state: 'England', type: 'Public' },
    { name: 'University of Warwick', country: 'United Kingdom', state: 'England', type: 'Public' },

    // Canada
    { name: 'University of Toronto', country: 'Canada', state: 'Ontario', type: 'Public' },
    { name: 'University of British Columbia', country: 'Canada', state: 'British Columbia', type: 'Public' },
    { name: 'McGill University', country: 'Canada', state: 'Quebec', type: 'Public' },
    { name: 'University of Waterloo', country: 'Canada', state: 'Ontario', type: 'Public' },
    { name: 'University of Alberta', country: 'Canada', state: 'Alberta', type: 'Public' },
    { name: 'McMaster University', country: 'Canada', state: 'Ontario', type: 'Public' },
    { name: 'University of Ottawa', country: 'Canada', state: 'Ontario', type: 'Public' },
    { name: 'Western University', country: 'Canada', state: 'Ontario', type: 'Public' },
    { name: 'Queen\'s University', country: 'Canada', state: 'Ontario', type: 'Public' },
    { name: 'University of Calgary', country: 'Canada', state: 'Alberta', type: 'Public' },

    // Australia
    { name: 'University of Melbourne', country: 'Australia', state: 'Victoria', type: 'Public' },
    { name: 'Australian National University', country: 'Australia', state: 'ACT', type: 'Public' },
    { name: 'University of Sydney', country: 'Australia', state: 'New South Wales', type: 'Public' },
    { name: 'University of New South Wales', country: 'Australia', state: 'New South Wales', type: 'Public' },
    { name: 'University of Queensland', country: 'Australia', state: 'Queensland', type: 'Public' },
    { name: 'Monash University', country: 'Australia', state: 'Victoria', type: 'Public' },
    { name: 'University of Western Australia', country: 'Australia', state: 'Western Australia', type: 'Public' },
    { name: 'University of Adelaide', country: 'Australia', state: 'South Australia', type: 'Public' },

    // India
    { name: 'Indian Institute of Technology Bombay', country: 'India', state: 'Maharashtra', type: 'Public' },
    { name: 'Indian Institute of Technology Delhi', country: 'India', state: 'Delhi', type: 'Public' },
    { name: 'Indian Institute of Technology Madras', country: 'India', state: 'Tamil Nadu', type: 'Public' },
    { name: 'Indian Institute of Science', country: 'India', state: 'Karnataka', type: 'Public' },
    { name: 'University of Delhi', country: 'India', state: 'Delhi', type: 'Public' },
    { name: 'Jawaharlal Nehru University', country: 'India', state: 'Delhi', type: 'Public' },

    // Singapore
    { name: 'National University of Singapore', country: 'Singapore', state: 'Singapore', type: 'Public' },
    { name: 'Nanyang Technological University', country: 'Singapore', state: 'Singapore', type: 'Public' },

    // Germany
    { name: 'Technical University of Munich', country: 'Germany', state: 'Bavaria', type: 'Public' },
    { name: 'RWTH Aachen University', country: 'Germany', state: 'North Rhine-Westphalia', type: 'Public' },
    { name: 'University of Stuttgart', country: 'Germany', state: 'Baden-Württemberg', type: 'Public' },

    // Switzerland
    { name: 'ETH Zurich', country: 'Switzerland', state: 'Zurich', type: 'Public' },
    { name: 'EPFL', country: 'Switzerland', state: 'Vaud', type: 'Public' }
];

module.exports = universities;
