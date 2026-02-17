import nlp from 'compromise';

export const extractEntities = (comments) => {
  const entities = {
    people: {},
    places: {},
    organizations: {},
  };

  comments.forEach((comment) => {
    const text =
      comment.snippet?.topLevelComment?.snippet?.textDisplay ||
      comment.snippet?.textDisplay ||
      '';
    
    // Remove HTML tags and decode entities
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ');
    
    const doc = nlp(cleanText);

    // Extract people
    doc.people().forEach((person) => {
      const name = person.text().trim();
      if (name.length > 1) {
        entities.people[name] = (entities.people[name] || 0) + 1;
      }
    });

    // Extract places
    doc.places().forEach((place) => {
      const name = place.text().trim();
      if (name.length > 1) {
        entities.places[name] = (entities.places[name] || 0) + 1;
      }
    });

    // Extract organizations
    doc.organizations().forEach((org) => {
      const name = org.text().trim();
      if (name.length > 1) {
        entities.organizations[name] = (entities.organizations[name] || 0) + 1;
      }
    });
  });

  // Convert to arrays and sort by frequency
  const processCategory = (category, limit = 30) => {
    return Object.entries(category)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  };

  return {
    people: processCategory(entities.people),
    places: processCategory(entities.places),
    organizations: processCategory(entities.organizations),
  };
};

export const getTotalEntities = (entityData) => {
  return (
    entityData.people.length +
    entityData.places.length +
    entityData.organizations.length
  );
};

export const getMostMentioned = (entityData) => {
  const allEntities = [
    ...entityData.people.map(e => ({ ...e, type: 'person' })),
    ...entityData.places.map(e => ({ ...e, type: 'place' })),
    ...entityData.organizations.map(e => ({ ...e, type: 'organization' })),
  ];
  
  if (allEntities.length === 0) return null;
  
  return allEntities.sort((a, b) => b.count - a.count)[0];
};
