function emptyOrRows(rows) {
  if (!rows) {
    console.log('emptyOrRows: rows is null or undefined');
    return {};
  }
  if (!Array.isArray(rows)) {
    console.log('emptyOrRows: rows is not an array, returning as is:', rows);
    return rows;
  }
  if (rows.length === 0) {
    console.log('emptyOrRows: rows is an empty array');
    return {};
  }
  console.log('emptyOrRows: returning rows:', rows);
  return rows;
}

function validID(id) {
  if(!id){
    return false
  }
  return !isNaN(id)
}

function formatSchedule(rows) {
  const result = {};

  for (const row of rows) {
    const { id, date, theatre_name, start_time, available } = row;

    if (!result[date]) {
      result[date] = {};
    }
    if (!result[date][theatre_name]) {
      result[date][theatre_name] = {};
    }
    result[date][theatre_name][start_time] = { available, scheduleId: id };
  }

  return result;
}

function formatSeats(data) {
  if (!data || !Array.isArray(data)) {
    console.log('Invalid seat data:', data);
    return {};
  }

  const result = {};

  for (const seat of data) {
    if (!seat || !seat.zone_name || !seat.row || !seat.seat_id) {
      console.log('Invalid seat entry:', seat);
      continue;
    }

    const zone = seat.zone_name;
    const row = seat.row;
    const seatId = seat.seat_id;
    
    if (!result[zone]) {
      result[zone] = {};
    }
    if (!result[zone][row]) {
      result[zone][row] = {};
    }
    result[zone][row][seatId] = {
      seat_id: seatId,
      row: seat.row,
      column: seat.column,
      zone_name: zone,
      is_spacer: Boolean(seat.is_spacer),
      available: Boolean(seat.available),
      is_reserve: Boolean(seat.is_reserve || 0)
    };
  }

  // Sort rows within each zone
  for (const zone of Object.keys(result)) {
    const sortedRows = {};
    Object.keys(result[zone])
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach(row => {
        sortedRows[row] = result[zone][row];
      });
    result[zone] = sortedRows;
  }

  return result;
}

module.exports = {
  emptyOrRows,
  validID,
  formatSchedule,
  formatSeats
}